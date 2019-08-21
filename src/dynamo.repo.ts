import { DynamoDB } from 'aws-sdk';
import * as _ from 'lodash';
import * as uuid from 'uuid/v4';
import { uniq } from 'lodash';

export interface Entity {
    id?: string;
}

export interface BaseRepository<TEntity extends Entity> {
    add(entity: TEntity): Promise<string>;
    delete(...ids: string[]): Promise<void>;
    load(id: string): Promise<TEntity>;
    loadMany(ids: string[]): Promise<TEntity[]>;
}

export class DynamoRepo<TEntity extends Entity> implements BaseRepository<TEntity> {
    private _dbClient = new DynamoDB.DocumentClient();
    private _createTableIfNotExists = _.memoize(this.createTableIfNotExists);
    private _readLimit = 10;
    private _writeLimit = 5;

    constructor(
        private tableName: string,
    ) {
    }

    protected createIdIfEmpty(item: TEntity) {
        if (!item.id) {
            item.id = uuid();
        }
    }

    async add(item: TEntity) {
        await this._createTableIfNotExists();
        this.createIdIfEmpty(item);
        await this._dbClient
            .put({
                TableName: this.tableName,
                Item: item,
            })
            .promise();
        return item.id;
    }

    async clear() {
        if (!await this.checkIfTableExists()) {
            return;
        }

        const dynamo = new DynamoDB({});
        await dynamo.deleteTable({ TableName: this.tableName }).promise();

        await dynamo
            .waitFor('tableNotExists', { TableName: this.tableName })
            .promise();

        this._createTableIfNotExists.cache.clear();
    }

    async delete(...ids: string[]) {
        await this._createTableIfNotExists();
        if (ids.length > 1) {
            const _ids = ids.map(_i => ({
                DeleteRequest: { Key: { id: _i } },
            }));
            let i = 0;
            do {
                await this._dbClient
                    .batchWrite({
                        RequestItems: {
                            [this.tableName]: i + this._writeLimit < _ids.length ?
                                _ids.slice(i, i + this._writeLimit) :
                                _ids.slice(i),
                        },
                    })
                    .promise();
                i += this._writeLimit;
            } while (i < _ids.length);
        } else {
            await this._dbClient
                .delete({
                    TableName: this.tableName,
                    Key: { id: ids[0] },
                })
                .promise();
        }
    }

    async load(id: string, ...fields: (keyof TEntity)[]) {
        await this._createTableIfNotExists();

        const rsp = await this._dbClient
            .get({
                TableName: this.tableName,
                Key: { id },
                ProjectionExpression: fields && fields.length ? uniq(fields).join(',') : undefined,
            })
            .promise();
        return rsp.Item as TEntity;
    }

    async loadMany(ids: string[], ...fields: (keyof TEntity)[]) {
        const _ids = ids.map(id => ({ id }));
        let items: TEntity[] = [];
        let rsp: any, i = 0;
        do {
            rsp = await this._dbClient
                .batchGet({
                    RequestItems: {
                        [this.tableName]: {
                            Keys: i + this._readLimit < _ids.length ?
                                _ids.slice(i, i + this._readLimit) :
                                _ids.slice(i),
                            ProjectionExpression: fields && fields.length ? uniq(fields).join(',') : undefined,
                        },
                    },
                })
                .promise();
            items = [...items, ...rsp.Responses[this.tableName]];
            i += this._readLimit;
        } while (i < _ids.length);
        return items;
    }

    protected async query<T extends TEntity>(keyConditionExpression: string, { values, names, fields }: {
        values?: any,
        names?: any,
        fields?: (keyof T)[],
    } = {}) {
        await this._createTableIfNotExists();
        let exclusiveStartKey = null, items: T[] = [];
        do {
            const rsp = await this._dbClient
                .query({
                    TableName: this.tableName,
                    ProjectionExpression: fields && fields.length ? uniq(fields).join(',') : undefined,
                    KeyConditionExpression: keyConditionExpression ? keyConditionExpression : undefined,
                    ExpressionAttributeValues: values,
                    ExpressionAttributeNames: names,
                    ExclusiveStartKey: exclusiveStartKey != null ? exclusiveStartKey : undefined,
                }).promise();
            if (rsp.Items) {
                items = [...items, ...rsp.Items as T[]];
            }
            exclusiveStartKey = rsp.LastEvaluatedKey;
        } while (exclusiveStartKey);

        return items;
    }

    protected async scan<T extends TEntity>(filterExpression?: string, { values, names, fields }: {
        values?: any,
        names?: any,
        fields?: (keyof T)[],
    } = {}) {
        await this._createTableIfNotExists();
        let exclusiveStartKey = null, items: T[] = [];
        do {
            const rsp = await this._dbClient
                .scan({
                    TableName: this.tableName,
                    ProjectionExpression: fields && fields.length ? uniq(fields).join(',') : undefined,
                    FilterExpression: filterExpression ? filterExpression : undefined,
                    ExpressionAttributeValues: values,
                    ExpressionAttributeNames: names,
                    ExclusiveStartKey: exclusiveStartKey != null ? exclusiveStartKey : undefined,
                }).promise();
            if (rsp.Items) {
                items = [...items, ...rsp.Items as T[]];
            }
            exclusiveStartKey = rsp.LastEvaluatedKey;
        } while (exclusiveStartKey);

        return items;
    }

    private async checkIfTableExists() {
        const dynamo = new DynamoDB({});
        const rsp = await dynamo
            .listTables()
            .promise();
        return rsp.TableNames.indexOf(this.tableName) >= 0;
    }

    private async createTableIfNotExists() {
        if (await this.checkIfTableExists()) {
            return;
        }

        const dynamo = new DynamoDB({});
        await dynamo
            .createTable({
                AttributeDefinitions: [{
                    AttributeName: 'id',
                    AttributeType: 'S',
                }],
                TableName: this.tableName,
                KeySchema: [{
                    AttributeName: 'id',
                    KeyType: 'HASH',
                }],
                ProvisionedThroughput: {
                    ReadCapacityUnits: this._readLimit,
                    WriteCapacityUnits: this._writeLimit,
                },
            })
            .promise();

        await dynamo
            .waitFor('tableExists', { TableName: this.tableName })
            .promise();
    }
}
