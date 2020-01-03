package de.se.team3.logic.domain

import de.se.team3.logic.container.UserContainer
import java.time.Instant
import kotlin.collections.ArrayList
import org.json.JSONArray
import org.json.JSONObject

class ProcessGroup(
    var id: Int?,
    var owner: User,
    var title: String,
    var description: String,
    val createdAt: Instant,
    val members: MutableList<User>
) {

    constructor(id: Int, owner: User, title: String, createdAt: Instant) :
        this(id, owner, title, "", createdAt, ArrayList<User>())

    /**
     * Creates a new process group with no specified ID.
     */
    constructor(title: String, description: String, ownerID: String, createdAt: Instant) :
            this(null, UserContainer.getUser(ownerID), title, "", createdAt, ArrayList<User>())

    /**
     * Creates a new process group, and adds a given list of users to it.
     */
    constructor(id: Int, owner: User, title: String, createdAt: Instant, members: MutableList<User>) :
        this(id, owner, title, "", createdAt, members)

    fun toJSON(): JSONObject {
        val json = JSONObject()
        json.put("id", this.id)
        json.put("title", this.title)
        json.put("description", this.description)
        json.put("ownerId", this.owner.id)
        json.put("createdAt", this.createdAt)
        json.put("membersIds", JSONArray(members.map { id }))
        return json
    }
}
