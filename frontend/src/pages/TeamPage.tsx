import React from 'react'
import { Card, Typography } from 'antd'

const { Title } = Typography

const TeamPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>团队协作</Title>
        <p>这里将显示团队协作功能，包括成员管理、权限设置、协作工作流等。</p>
        <p>功能开发中...</p>
      </Card>
    </div>
  )
}

export default TeamPage