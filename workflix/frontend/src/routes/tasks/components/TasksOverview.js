// @flow

import React from 'react'
import type { ProcessType } from '../../../modules/datatypes/Process'
import ProcessApi from '../../../modules/api/ProcessApi'
import ProcessCard from './ProcessCard'
import styled from 'styled-components'
import type { TaskTemplateType, TaskType } from '../../../modules/datatypes/Task'
import UserApi from '../../../modules/api/UsersApi'
import type { UserType } from '../../../modules/datatypes/User'
import withPromiseResolver from '../../../modules/app/hocs/withPromiseResolver'
import TaskDrawer from './drawer/TaskDrawer'
import type { FiltersType } from '../types/Filters'
import Filters from './filtering/Filters'

const ProcessListWrapper = styled<{}, {}, 'div'>('div')`
  display: flex;
  flex: 1;
  justify-content: center;
  flex-direction: row;
`

type PropsType = {|
  initialProcesses: Array<ProcessType>,
  initialTaskTemplates: Map<number, TaskTemplateType>,
  users: Map<string, UserType>,
  path: string
|}
type StateType = {|
  selectedTask: ?TaskType,
  processes: ProcessType[],
  taskTemplates: Map<number, TaskTemplateType>,
  filters: FiltersType
|}

const getUpdatedOrOldTask: (TaskType, TaskType) => TaskType = (oldTask, newTask) => {
  return newTask.id === oldTask.id ? newTask : oldTask
}

class TasksOverview extends React.Component<PropsType, StateType> {
  state = {
    selectedTask: null,
    processes: this.props.initialProcesses || [],
    taskTemplates: this.props.initialTaskTemplates || new Map<number, TaskTemplateType>(),
    filters: {}
  }

  onTaskSelected = (selectedTask: TaskType) => {
    this.setState({ selectedTask: selectedTask })
  }

  onDrawerClosed = () => {
    this.setState({ selectedTask: null })
  }

  onTaskModified = (modifiedTask: TaskType) => {
    this.setState(oldState => ({
      selectedTask: oldState.selectedTask
        ? getUpdatedOrOldTask(oldState.selectedTask, modifiedTask)
        : oldState.selectedTask,
      processes: oldState.processes.map(proc => ({
        ...proc,
        tasks: proc.tasks.map(oldTask => getUpdatedOrOldTask(oldTask, modifiedTask))
      }))
    }))
  }

  onFiltersChanged = (newFilters: FiltersType) => {
    new ProcessApi().getProcesses(newFilters)
      .then(
        processes => Promise.all([
          Promise.resolve(processes),
          new ProcessApi().getTaskTemplatesForProcessTemplates(processes.map(proc => proc.processTemplateId))
        ]))
      .then(
        ([processes, taskTemplates]) =>
          this.setState({
            processes,
            taskTemplates,
            filters: newFilters
          }))
      .catch(err => console.error(err))
  }

  render () {
    return <div>
      <Filters onFiltersChanged={this.onFiltersChanged} filters={this.state.filters}/>
      <ProcessListWrapper>{
        this.state.processes.map(process => (
          <ProcessCard
            key={process.id}
            process={process}
            selectedTask={this.state.selectedTask}
            onTaskSelected={this.onTaskSelected}
            users={this.props.users}
            taskTemplates={this.state.taskTemplates}/>)
        )
      }</ProcessListWrapper>
      <TaskDrawer
        selectedTask={this.state.selectedTask}
        onClose={this.onDrawerClosed}
        onTaskModified={this.onTaskModified}
        users={this.props.users}
        taskTemplates={this.state.taskTemplates}/>
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
    initialTaskTemplates: taskTemplates
  })
)

export default withPromiseResolver<PropsType, {|
  initialProcesses: Array<ProcessType>,
  initialTaskTemplates: Map<number, TaskTemplateType>,
  users: Map<string, UserType>
|}>(promiseCreator)(TasksOverview)