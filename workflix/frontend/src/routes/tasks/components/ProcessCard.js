// @flow

import React from 'react'
import styled from 'styled-components'
import { Card, H3, ProgressBar } from '@blueprintjs/core'
import type { ProcessType } from '../../../modules/datatypes/Process'
import TaskSummaryCard from './TaskSummaryCard'
import type { StyledComponent } from 'styled-components'
import { Elevation } from '@blueprintjs/core/lib/cjs/common/elevation'
import type { TaskTemplateType, TaskType } from '../../../modules/datatypes/Task'
import type { UserType } from '../../../modules/datatypes/User'
import { Intent } from '@blueprintjs/core/lib/cjs/common/intent'

const CardWithMargin: StyledComponent<{}, {}, *> = styled(Card)`
  margin: 5px;
`

const TaskList = styled<{}, {}, 'div'>('div')`
  display: flex;
  flex: 1;
  justify-content: center;
  flex-direction: column;
`
const ProcessProgress = styled(ProgressBar)`
  margin-top: 7px;
`

type PropsType = {
  process: ProcessType,
  selectedTask: ?TaskType,
  onTaskSelected: TaskType => void,
  users: Map<string, UserType>,
  taskTemplates: Map<number, TaskTemplateType>
}

class ProcessCard extends React.Component<PropsType> {
  isSelected (task: TaskType): boolean {
    const selectedTask = this.props.selectedTask
    return selectedTask != null && task.id === selectedTask.id
  }

  render () {
    const process = this.props.process
    const [progressIntent, progressValue] =
      process.status === 'ABORTED'
        ? [Intent.DANGER, 1]
        : process.status === 'CLOSED'
          ? [Intent.SUCCESS, 1]
          : [Intent.PRIMARY, process.progress]
    const isSelected = !!process.tasks.find(task => this.isSelected(task))
    return <CardWithMargin interactive elevation={isSelected ? Elevation.FOUR : undefined}>
      <H3>{process.title} (#{process.id})</H3>
      <TaskList>
        {
          process.tasks.map(task => (
            <TaskSummaryCard key={task.id}
                             task={task}
                             selected={this.isSelected(task)}
                             onTaskSelected={this.props.onTaskSelected}
                             users={this.props.users}
                             taskTemplates={this.props.taskTemplates}/>
          ))
        }
      </TaskList>
      <ProcessProgress animate={false} intent={progressIntent} value={progressValue}/>
    </CardWithMargin>
  }
}

export default ProcessCard
