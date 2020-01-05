// @flow

import React from 'react'
import type { TaskStateType, TaskTemplateType, TaskType } from '../../../modules/datatypes/Task'
import { Card, Colors } from '@blueprintjs/core'
import styled from 'styled-components'
import { Elevation as ELEVATION } from '@blueprintjs/core/lib/cjs/common/elevation'
import type { UserType } from '../../../modules/datatypes/User'

const FinishedTaskStyling = styled<{ status: TaskStateType }, {}, 'div'>('div')`
  margin: 3px 0;
  ${props => props.status !== 'BLOCKED' && `
  & > * {
    border: 1px solid ${props.status === 'CLOSED' ? Colors.GREEN4 : Colors.ORANGE4};
  }
`}
`

type PropsType = {
  task: TaskType,
  selected: boolean,
  onTaskSelected: (TaskType) => void,
  users: Map<string, UserType>,
  taskTemplates: Map<number, TaskTemplateType>
}

class TaskSummaryCard extends React.Component<PropsType> {
  onClick = () => this.props.onTaskSelected(this.props.task)

  render () {
    const task = this.props.task
    const taskTemplate = this.props.taskTemplates.get(task.taskTemplateId)
    return <FinishedTaskStyling status={task.status}>
      <Card interactive elevation={this.props.selected ? ELEVATION.FOUR : undefined}
            onClick={this.onClick}>
        <span><b>{taskTemplate ? taskTemplate.name : ''}</b></span><br/>
        <small>{task.assignments.length === 0 ? 'no assignees'
          : <span>{
            task.assignments.map(assignee => {
              const user = this.props.users.get(assignee.assigneeId)
              return <span key={assignee.assigneeId} className='comma'>
                {user ? user.name : assignee.assigneeId}
              </span>
            })
          }</span>}</small>
      </Card>
    </FinishedTaskStyling>
  }
}

export default TaskSummaryCard
