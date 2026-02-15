import React, { useState, useMemo } from 'react'
import AppRouter from './routes/AppRouter'
import { ConfigProvider, theme } from 'antd'

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false)

  const antdTheme = useMemo(() => {
    return {
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: isDark
        ? {
            colorPrimary: '#a78bfa',
            colorBgBase: '#0f172a',
            colorBgLayout: '#0f172a',
            colorBgContainer: '#1e1b4b',
            colorBgElevated: '#312e81',
            colorText: '#e5e7eb',
          }
        : {
            colorPrimary: '#7c3aed',
            colorBgBase: '#f5f3ff',
            colorBgLayout: '#f5f3ff',
            colorBgContainer: '#ffffff',
            colorBgElevated: '#ede9fe',
            colorText: '#1f2937',
          },

      components: {
        Layout: {
          headerBg: isDark ? '#1e1b4b' : '#ffffff',
          siderBg: isDark ? '#1e1b4b' : '#ffffff',
          bodyBg: isDark ? '#0f172a' : '#f5f3ff',
        },
        Menu: {
          darkItemBg: isDark ? '#1e1b4b' : '#ffffff',
          darkSubMenuItemBg: isDark ? '#1e1b4b' : '#ffffff',
          itemSelectedBg: isDark ? '#312e81' : '#ede9fe',
          itemSelectedColor: '#a78bfa',
        },
        Drawer: {
          colorBgElevated: isDark ? '#1e1b4b' : '#ffffff',
          colorBgMask: 'rgba(10, 5, 20, 0.75)',
        },
      }
    }
  }, [isDark])

  return (
    <ConfigProvider theme={antdTheme}>
      <div
        style={{
          minHeight: '100vh',
          transition: 'all 0.3s ease',
        }}
      >
        <AppRouter setIsDark={setIsDark} isDark={isDark}/>
      </div>
    </ConfigProvider>
  )
}

export default App
