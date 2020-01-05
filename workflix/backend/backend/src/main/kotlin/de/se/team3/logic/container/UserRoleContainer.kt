package de.se.team3.logic.container

import de.se.team3.logic.domain.UserRole
import de.se.team3.logic.exceptions.NotFoundException
import de.se.team3.persistence.daos.UserRoleDAO
import de.se.team3.webservice.containerInterfaces.UserRoleContainerInterface

object UserRoleContainer : UserRoleContainerInterface {

    private val userRoleCache = HashMap<Int, UserRole>()

    override fun getAllUserRoles(): List<UserRole> {
        return UserRoleDAO.getAllUserRoles()
    }

    override fun getUserRole(userRoleID: Int): UserRole {
        return if (userRoleCache.containsKey(userRoleID)) {
            userRoleCache[userRoleID]!!
        } else {
            val userRole = UserRoleDAO.getUserRole(userRoleID)
                ?: throw NotFoundException("user role $userRoleID does not exist")

            userRoleCache[userRoleID] = userRole
            userRole
        }
    }

    /**
     * Checks whether the specified user role exists or not.
     */
    fun hasUserRole(userRoleId: Int): Boolean {
        if (userRoleCache.containsKey(userRoleId))
            return true

        val userRole = UserRoleDAO.getUserRole(userRoleId)
        if (userRole != null) {
            userRoleCache.put(userRoleId, userRole)
            return true
        }

        return false
    }

    override fun createUserRole(userRole: UserRole): Int {
        val newID = UserRoleDAO.createUserRole(userRole)
        userRoleCache[newID] = userRole
        return newID
    }

    override fun updateUserRole(userRole: UserRole) {
        UserRoleDAO.updateUserRole(userRole)
        userRoleCache[userRole.id] = userRole
    }

    override fun updateUserRole(userRoleID: Int, name: String, description: String) {
        val userRole = getUserRole(userRoleID)
        userRole.name = name
        userRole.description = description
        updateUserRole(userRole)
    }

    override fun deleteUserRole(userRoleID: Int) {
        if (!UserRoleDAO.deleteUserRole(userRoleID))
            throw NotFoundException("user role $userRoleID does not exist")
        userRoleCache.remove(userRoleID)
    }

    override fun addUserToRole(userID: String, userRoleID: Int) {
        UserRoleDAO.addUserToRole(userID, userRoleID)
        if (userRoleCache.containsKey(userRoleID))
            userRoleCache[userRoleID]!!.members.add(UserContainer.getUser(userID))
        else
            userRoleCache[userRoleID] = getUserRole(userRoleID)
    }

    override fun deleteUserFromRole(userID: String, userRoleID: Int) {
        UserRoleDAO.deleteUserFromRole(userID, userRoleID)
        if (userRoleCache.containsKey(userRoleID))
            userRoleCache[userRoleID]!!.members.remove(UserContainer.getUser(userID))
        else
            userRoleCache[userRoleID] = getUserRole(userRoleID)
    }
}
