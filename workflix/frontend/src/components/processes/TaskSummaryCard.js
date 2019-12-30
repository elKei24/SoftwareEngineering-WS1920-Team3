// @flow

import React from 'react'
import type { TaskType } from '../../datatypes/TaskType'
import { Card, Colors } from '@blueprintjs/core'
import styled from 'styled-components'
import { Elevation as ELEVATION } from '@blueprintjs/core/lib/cjs/common/elevation'
import type { UserType } from '../../datatypes/models'

const FinishedTaskStyling = styled<{ taskFinished: boolean }, {}, 'div'>('div')`
  margin: 3px;
  ${props => props.taskFinished ? `
  & > * {
    background: ${Colors.GREEN4};
  }
` : ''}
`

type PropsType = {
  task: TaskType,
  selected: boolean,
  onTaskSelected: (TaskType) => void,
  users: Map<string, UserType>
}

class TaskSummaryCard extends React.Component<PropsType> {
  onClick = () => this.props.onTaskSelected(this.props.task)

  render () {
    const task = this.props.task
    return <FinishedTaskStyling taskFinished={task.done}>
      <Card interactive elevation={this.props.selected ? ELEVATION.FOUR : undefined}
            onClick={this.onClick}>
        <p><b>{task.taskTemplate.name}</b></p>
        <p>{task.assignments.length === 0 ? 'No Assignees'
          : <span>Assigned to: {
            task.assignments.map(assignee => {
              const user = this.props.users.get(assignee.assigneeId)
              return <span key={assignee.assigneeId} className='comma'>
                {user ? user.name : assignee.assigneeId}
              </span>
            })
          }</span>}</p>
      </Card>
    </FinishedTaskStyling>
  }
}

export default TaskSummaryCard
