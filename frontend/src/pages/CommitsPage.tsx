import React from 'react'
import { Card, Typography } from 'antd'

const { Title } = Typography

const CommitsPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>提交历史</Title>
        <p>这里将显示提交历史功能，包括查看提交记录、比较提交差异等。</p>
        <p>功能开发中...</p>
      </Card>
    </div>
  )
}

export default CommitsPage