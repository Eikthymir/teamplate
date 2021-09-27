// https://www.html5plus.org/doc/zh_cn/sqlite.html
/**
 * 数据库表 
 * music: 存储本地音乐信息*/
import {
	getPath
} from '@/common/js/utils.js'
export class HySQLite {
	sqlPath = 'hyMusic.db'
	sqlName = 'hyMusic'
	appPath = 'hyMusic.db'
	openCount = 0
	constructor(arg) {
		this.sqlPath = getPath({type: 'database'}) + this.appPath
	}
	/**
	 * @Description 打开数据库, 如果数据库存在则打开，不存在则创建。
	 * @param  *name：（string） 数据库名称， *path：（string）数据库路径
	 * @return Promise
	 */
	openDB({
		name = this.sqlName,
		path = this.sqlPath
	}) {
		let _this = this
		return new Promise((resolve, reject) => {
			plus.sqlite.openDatabase({
				name: name,
				path: path,
				success: (e) => {
					console.log('open dataBase success')
					_this.openCount++
					resolve(true)
				},
				fail: (e) => {
					this.closeDB();
					this.openDB();
					console.log('open dataBase fail', JSON.stringify(e), name, path)
					reject(false)
				}
			})
		})
	}

	/**
	 * @Description 判断数据库是否打开, 数据库已经打开则返回true，数据库没有打开则返回false。
	 * @param  *name：（string） 数据库名称， *path：（string）数据库路径
	 * @return Boolean : true表示数据库已打开，false表示数据库没有打开。
	 */
	isOpenDB({
		name = this.sqlName,
		path = this.sqlPath
	}) {
		return plus.sqlite.isOpenDatabase({
			name: name,
			path: path
		})
	}

	/**
	 * @Description 完成数据库操作后，必须关闭数据库，否则可能会导致系统资源无法释放。
	 * @param  *name：（string） 数据库名称, #callback:(function) 回调方法
	 * @return Promise
	 */
	closeDB({
		name = this.sqlName
	}) {
		let _this = this
		return new Promise((resolve, reject) => {
			plus.sqlite.closeDatabase({
				name: name,
				success: function(e) {
					console.log('closeDatabase success!');
					_this.openCount = 0
					resolve()
				},
				fail: function(e) {
					console.log('closeDatabase failed: ' + JSON.stringify(e));
					reject()
				}
			});
		})
	}

	/**
	 * @Description 执行事务
	 * @param  *name：（string） 数据库名称, *operation:(String ) 需要执行的事务操作,可选值：begin（开始事务）、commit（提交）、rollback（回滚）
	 * @return Promise
	 */
	transactionDB({
		name = this.sqlName,
		operation
	}) {
		return new Promise((resolve, reject) => {
			plus.sqlite.transaction({
				name: name,
				operation: operation,
				success: function(e) {
					console.log('transaction success!');
					resolve(true)
				},
				fail: function(e) {
					console.log('transaction failed: ' + JSON.stringify(e))
					reject(false)
				}
			})
		})
	}

	/**
	 * @Description 执行增删改等操作的SQL语句
	 * @param  *name：（string） 数据库名称, *sql:(String) 需要执行的SQL语句
	 * @return Promise
	 */
	executeSql({
		name = this.sqlName,
		sql
	}) {
		return new Promise((resolve, reject) => {
			try {
				plus.sqlite.executeSql({
					name: name,
					sql: sql,
					success: (e) => {
						console.log('executeSql success!');
						resolve()
					},
					fail: (e) => {
						console.log('executeSql failed: ' + JSON.stringify(e));
						reject()
					}
				})
			} catch (e) {
				//TODO handle the exception
				console.log('executeSql', e)
			}
		})
	}

	/**
	 * @Description 执行查询的SQL语句
	 * @param  *name：（string） 数据库名称, *sql:(String) 需要执行的SQL语句
	 * @return Promise
	 */
	selectSQL({
		name = this.sqlName,
		sql
	}) {
		return new Promise((resolve, reject) => {
			plus.sqlite.selectSql({
				name: name,
				sql: sql,
				success: function(data) {
					console.log('selectSql success: ');
					for (var i in data) {
						console.log(data[i]);
					}
					resolve(data)
				},
				fail: function(e) {
					console.log('selectSql failed: ' + JSON.stringify(e));
					reject()
				}
			})
		})
	}


	/**
	 * @Description 添加数据， 推荐添加一条数据时使用
	 * @param  *tableName：（string） 表名, *columns:(String) 插入数据的表中的列的名称如: (column1, column2, column3,...columnN) ，
	 * 		*values:(String) 插入数据的表中的数据如: (value1,value2,value3,...valueN)
	 * @return Promise
	 */
	async addDB({
		tableName,
		columns,
		values
	}) {
		try {
			// 判断数据库是否打开，并打开数据库
			if (!this.isOpenDB({})) {
				await this.openDB({})
			}
			await this.transactionDB({
				operation: 'begin'
			})
			let sqlString = 'INSERT INTO ' + tableName + ' ' + columns + ' VALUES ' + values

			await this.executeSql({
				sql: sqlString
			})
			await this.transactionDB({
				operation: 'commit'
			})
			// 判断数据库是否打开，并打开数据库
			if (this.isOpenDB({})) {
				await this.closeDB({})
			}
			return true
		} catch (e) {
			//TODO handle the exception
			// 判断数据库是否打开，并打开数据库
			if (this.isOpenDB({})) {
				await this.closeDB({})
			}
			return false
		}
	}

	/**
	 * @Description 删除数据， 推荐删除一条数据时使用
	 * @param  *tableName：（string） 表名, *whereString:(string) delete时的where语句
	 * @return Promise
	 */
	async deleteDB({
		tableName,
		whereString
	}) {
		try {
			// 判断数据库是否打开，并打开数据库
			if (!this.isOpenDB({})) {
				await this.openDB({})
			}
			await this.transactionDB({
				operation: 'begin'
			})

			let sqlString = 'DELETE FROM ' + tableName + ' ' + whereString
			await this.executeSql({
				sql: sqlString
			})

			await this.transactionDB({
				operation: 'commit'
			})

			// 判断数据库是否打开，并打开数据库
			if (this.isOpenDB({})) {
				await this.closeDB({})
			}
			return true
		} catch (e) {
			//TODO handle the exception
			// 判断数据库是否打开，并打开数据库
			if (this.isOpenDB({})) {
				await this.closeDB({})
			}
			return false
		}
	}

	/**
	 * @Description 执行查询的SQL语句  推荐添加一条数据时使用
	 * @param  *tableName：（string） 表名, *updateString:(String) 更新语句，
	 * 		*whereString:(String) where语句
	 * @return Promise
	 * sqlite语句见https://www.runoob.com/sqlite/sqlite-update.html
	 */
	async updateDB({
		tableName,
		updateString,
		whereString
	}) {
		try {
			// 判断数据库是否打开，并打开数据库
			if (!this.isOpenDB({})) {
				await this.openDB({})
			}
			await this.transactionDB({
				operation: 'begin'
			})

			let sqlString = 'UPDATE ' + tableName + ' SET ' + updateString + ' ' + whereString
			await this.executeSql({
				sql: sqlString
			})

			await this.transactionDB({
				operation: 'commit'
			})

			// 判断数据库是否打开，并打开数据库
			if (this.isOpenDB({})) {
				await this.closeDB({})
			}
			return true
		} catch (e) {
			//TODO handle the exception
			// 判断数据库是否打开，并打开数据库
			if (this.isOpenDB({})) {
				await this.closeDB({})
			}
			return false
		}
	}

	/**
	 * @Description 执行查询的SQL语句  推荐添加一条数据时使用
	 * @param  *name：（string） 数据库名, whereString：（String） 查询语句
	 * @return Promise
	 * sqlite语句见https://www.runoob.com/sqlite/sqlite-update.html
	 */
	async selectDB({
		name = this.sqlName,
		whereString
	}) {
		let res = []
		try {
			if (!this.isOpenDB({})) { // 判断数据库是否已经打开
				await this.openDB({})
			}
			res = await this.selectSQL({ // 查询数据
				name,
				sql: whereString
			})
			// 判断数据库是否打开，并打开数据库
			if (this.isOpenDB({})) {
				await this.closeDB({})
			}
			return res
		} catch (e) {
			//TODO handle the exception
			// 判断数据库是否打开，并打开数据库
			if (this.isOpenDB({})) {
				await this.closeDB({})
			}
			return res
		}
	}

	/**
	 * @Description 创建表格
	 * @param *tableName：（string） 要创建的表的名称
	 *			*contentValues:(Object) 内容值， 所谓的内容值，就是一个K,V 键值对，K指明字段名称即列名称，V指明字段值，即单元格内容,例如:
	 *	{
	 *		name: 'TEXT',
	 *		age: 'INTEGER'
	 *	}
	 * @return Promise
	 * sqlite的数据类型见https://www.runoob.com/sqlite/sqlite-data-types.html
	 */
	async createTable({
		tableName,
		contentValues = {}
	}, callback) {
		try {
			// 判断数据库是否打开，并打开数据库
			if (!this.isOpenDB({})) {
				await this.openDB({})
			}
			await this.transactionDB({
				operation: 'begin'
			})
			let contentValuesString = '' // 键值对字符串
			for (let index in contentValues) { // 将Object转化为键值对字符串
				contentValuesString += '"' + index + '" '
				contentValuesString += contentValues[index] + ','
			}
			contentValuesString = contentValuesString.substring(0, contentValuesString.length - 1) // 去除最后一个‘,’符号
			await this.executeSql({
				sql: 'create table if not exists ' + tableName + '(' + contentValuesString + ')'
			})
			await this.transactionDB({
				operation: 'commit'
			})
			// 判断数据库是否打开，并关闭数据库
			if (this.isOpenDB({})) {
				await this.closeDB({})
			}
			callback(true)
		} catch (e) {
			//TODO handle the exception
			// 判断数据库是否打开，并关闭数据库
			if (this.isOpenDB({})) {
				await this.closeDB({})
			}
			callback(false)
		}
	}

	/**
	 * @Description 删除表格
	 * @param *tableName：（string） 要删除的表的名称
	 * @return Promise
	 * sqlite的数据类型见https://www.runoob.com/sqlite/sqlite-data-types.html
	 */
	async dropTable({
		tableName
	}) {
		try {
			// 判断数据库是否打开，并打开数据库
			if (!this.isOpenDB({})) {
				await this.openDB({})
			}
			await this.transactionDB({
				operation: 'begin'
			})
			await this.executeSql({
				sql: 'DROP TABLE ' + tableName
			})
			await this.transactionDB({
				operation: 'commit'
			})
			// 判断数据库是否打开，并打开数据库
			if (this.isOpenDB({})) {
				await this.closeDB({})
			}
			return true
		} catch (e) {
			//TODO handle the exception
			// 判断数据库是否打开，并打开数据库
			if (this.isOpenDB({})) {
				await this.closeDB({})
			}
			return false
		}
	}
}
