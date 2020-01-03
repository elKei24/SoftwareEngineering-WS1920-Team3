package de.se.team3.persistence.daos

import de.se.team3.logic.DAOInterfaces.UserDAOInterface
import de.se.team3.logic.domain.User
import de.se.team3.persistence.meta.UsersTable
import me.liuwj.ktorm.dsl.eq
import me.liuwj.ktorm.dsl.insert
import me.liuwj.ktorm.dsl.iterator
import me.liuwj.ktorm.dsl.like
import me.liuwj.ktorm.dsl.limit
import me.liuwj.ktorm.dsl.select
import me.liuwj.ktorm.dsl.update
import me.liuwj.ktorm.dsl.where
import java.security.Key
import java.security.SecureRandom
import java.util.*
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec
import kotlin.NoSuchElementException
import kotlin.collections.ArrayList

object UserDAO : UserDAOInterface {

    //TODO store key safely
    private val key = SecretKeySpec(Arrays.copyOf("THISisAverySECUREkey".toByteArray(), 16), "AES");

    private fun encryptPassword(password: String): String {
        val data = key.getEncoded()
        val skeySpec = SecretKeySpec(data, 0, data.size, "AES")
        val cipher = Cipher.getInstance("AES", "BC")
        cipher.init(Cipher.ENCRYPT_MODE, skeySpec, IvParameterSpec(ByteArray(cipher.getBlockSize())))
        return cipher.doFinal(password.toByteArray()).toString()
    }

    private fun decryptPassword(encryptedPassword: String): String {
        val decrypted: ByteArray
        val cipher = Cipher.getInstance("AES", "BC")
        cipher.init(Cipher.DECRYPT_MODE, key, IvParameterSpec(ByteArray(cipher.blockSize)))
        return cipher.doFinal(encryptedPassword.toByteArray()).toString()
    }

    /**
     * {@inheritDoc}
     */
    override fun getAllUsers(): List<User> {
        val users = ArrayList<User>()
        val result = UsersTable.select()
        for (row in result)
            users.add(User(row[UsersTable.ID]!!, row[UsersTable.name]!!, row[UsersTable.displayname]!!, row[UsersTable.email]!!, decryptPassword(row[UsersTable.password]!!)))

        return users.toList()
    }

    override fun getUser(userId: String): User? {
        val result = UsersTable
            .select()
            .where { UsersTable.ID eq userId }

        val row = result.rowSet
        if (!row.next())
            return null
        return User(row[UsersTable.ID]!!, row[UsersTable.name]!!, row[UsersTable.displayname]!!, row[UsersTable.email]!!, decryptPassword(row[UsersTable.password]!!))
    }

    override fun createUser(user: User) {
        UsersTable.insert {
            it.ID to user.id
            it.name to user.name
            it.displayname to user.displayname
            it.email to user.email
            it.password to encryptPassword(user.password)
            it.deleted to false
        }
    }

    override fun create***REMOVED***User(email: String, password: String) {
        val ***REMOVED***User = User.query***REMOVED***andCreateUser(email, password)
        UsersTable.insert {
            it.ID to ***REMOVED***User.id
            it.name to ***REMOVED***User.name
            it.displayname to ***REMOVED***User.displayname
            it.email to ***REMOVED***User.email
            it.password to encryptPassword(***REMOVED***User.password)
            it.deleted to false
        }
    }

    /**
     * Updates the user data on basis of the given user's id.
     */
    override fun updateUser(user: User) {
        UsersTable.update {
            it.name to user.name
            it.displayname to user.displayname
            it.email to user.email
            it.password to encryptPassword(user.password)
            it.deleted to false

            where { it.ID like user.id }
        }
    }

    override fun deleteUser(user: User) {
        val affectedRows = UsersTable.update {
            it.deleted to true
            where { it.ID like user.id }
        }
        if (affectedRows == 0)
            throw NoSuchElementException()
    }
}
