package de.se.team3.persistence.daos

import de.se.team3.logic.DAOInterfaces.UserDAOInterface
import de.se.team3.logic.domain.User
import de.se.team3.persistence.meta.UsersTable
import me.liuwj.ktorm.database.Database
import me.liuwj.ktorm.database.TransactionIsolation
import me.liuwj.ktorm.dsl.*

object UserDAO : UserDAOInterface {

    /**
     * {@inheritDoc}
     */
    override fun getAllUsers(offset: Int, limit: Int): Pair<List<User>, Int> {
        val users = ArrayList<User>()
        val result = UsersTable.select().limit(offset, limit)
        for (row in result)
            users.add(User(row[UsersTable.ID]!!, row[UsersTable.name]!!, row[UsersTable.displayname]!!, row[UsersTable.email]!!))

        return Pair(users.toList(), result.totalRecords)
    }

    override fun getUser(userId: String): User {
        val result = UsersTable
            .select().where { UsersTable.ID eq userId }

        val row = result.rowSet.iterator().next()
        return User(row[UsersTable.ID]!!, row[UsersTable.name]!!, row[UsersTable.displayname]!!, row[UsersTable.email]!!)
    }

    override fun createUser(user: User) {
        val transactionManager = Database.global.transactionManager
        val transaction = transactionManager.newTransaction(isolation = TransactionIsolation.REPEATABLE_READ)

        try {// adds the process template to db
            val generatedProcessTemplateId = UsersTable.insert {
                it.ID to user.id
                it.name to user.name
                it.displayname to user.displayname
                it.email to user.email
            }

            transaction.commit()

        } catch (e: Throwable) {
            throw StorageException("Storage Exception: " + e.message)
        }
    }

    override fun updateUser(user: User) {
    }

    override fun deleteUser(user: User) {
    }
}
