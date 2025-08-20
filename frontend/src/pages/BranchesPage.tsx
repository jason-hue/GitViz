import React from 'react'
import { Card, Typography } from 'antd'

const { Title } = Typography

const BranchesPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>分支管理</Title>
        <p>这里将显示分支管理功能，包括创建、合并、删除分支等。</p>
        <p>功能开发中...</p>
      </Card>
    </div>
  )
}

export default BranchesPage