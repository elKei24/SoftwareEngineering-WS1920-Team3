// @flow

import React from 'react'
import type { ProcessType } from '../../datatypes/ProcessType'
import ProcessApi from '../../api/ProcessApi'
import withPromiseResolver from '../withPromiseResolver'
import ProcessCard from './ProcessCard'
import styled from 'styled-components'
import type { TaskTemplateType, TaskType } from '../../datatypes/TaskType'
import TaskDrawer from './TaskDrawer'
import UserApi from '../../api/UsersApi'
import type { UserType } from '../../datatypes/models'

const ProcessListWrapper = styled<{}, {}, 'div'>('div')`
  display: flex;
  flex: 1;
  justify-content: center;
  flex-direction: row;
`

type PropsType = {|
  initialProcesses: Array<ProcessType>,
  taskTemplates: Map<number, TaskTemplateType>,
  users: Map<string, UserType>,
  path: string
|}

class TasksOverview extends React.Component<PropsType, { selectedTask: ?TaskType, processes: ProcessType[] }> {
  state = { selectedTask: null, processes: this.props.initialProcesses || [] }

  onTaskSelected = (selectedTask: TaskType) => {
    this.setState({ selectedTask: selectedTask })
  }

  onDrawerClosed = () => {
    this.setState({ selectedTask: null })
  }

  onTaskModified = () => {
    this.forceUpdate()
  }

  render () {
    return <div>
      <ProcessListWrapper>{
        this.state.processes.map(process => (
          <ProcessCard
            key={process.id}
            process={process}
            selectedTask={this.state.selectedTask}
            onTaskSelected={this.onTaskSelected}
            users={this.props.users}
            taskTemplates={this.props.taskTemplates} />)
        )
      }</ProcessListWrapper>
      <TaskDrawer
        selectedTask={this.state.selectedTask}
        onClose={this.onDrawerClosed}
        onTaskModified={this.onTaskModified}
        users={this.props.users}
        taskTemplates={this.props.taskTemplates} />
    </div>
  }
}

const promiseCreator = () => Promise.all([
  new ProcessApi().getProcesses(),
  new UserApi().getUsers()
]).then(
  ([processes, users]) => Promise.all([
    Promise.resolve(processes),
    Promise.resolve(users),
    new ProcessApi().getTaskTemplatesForProcessTemplates(processes.map(proc => proc.processTemplateId))
  ])).then(
  ([processes, users, taskTemplates]) => ({
    initialProcesses: processes,
    users: users,
    taskTemplates: taskTemplates
  })
)

export default withPromiseResolver<PropsType, {|
  initialProcesses: Array<ProcessType>,
  users: Map<string, UserType>,
  taskTemplates: Map<number, TaskTemplateType>
|}>(promiseCreator)(TasksOverview)
