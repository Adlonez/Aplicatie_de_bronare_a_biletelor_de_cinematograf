import React, { useState, useMemo } from 'react'
import AppRouter from './routes/AppRouter'
import { ConfigProvider, theme } from 'antd'
import './App.css'

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false)

  const antdTheme = useMemo(() => {
    const sharedToken = {
      borderRadius: 8,
      borderRadiusLG: 8,
      borderRadiusSM: 6,
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      colorPrimary: '#7c3aed',
      colorInfo: '#7c3aed',
      colorSuccess: '#14b8a6',
      colorWarning: '#f5b642',
      colorError: '#ef4444',
      motionDurationMid: '0.24s',
    }

    return {
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        ...sharedToken,
        ...(isDark
          ? {
              colorPrimary: '#a855f7',
              colorPrimaryHover: '#c084fc',
              colorPrimaryActive: '#7e22ce',
              colorBgBase: '#07060c',
              colorBgLayout: '#07060c',
              colorBgContainer: '#12101a',
              colorBgElevated: '#1b1426',
              colorText: '#f8f3ff',
              colorTextSecondary: '#c8b8d9',
              colorTextTertiary: '#9582aa',
              colorBorder: 'rgba(192, 132, 252, 0.22)',
              colorBorderSecondary: 'rgba(192, 132, 252, 0.14)',
            }
          : {
              colorPrimary: '#6d28d9',
              colorPrimaryHover: '#7c3aed',
              colorPrimaryActive: '#5b21b6',
              colorBgBase: '#fbf8ff',
              colorBgLayout: '#f4edff',
              colorBgContainer: '#ffffff',
              colorBgElevated: '#ffffff',
              colorText: '#21152f',
              colorTextSecondary: '#665477',
              colorTextTertiary: '#8b7a9b',
              colorBorder: 'rgba(109, 40, 217, 0.2)',
              colorBorderSecondary: 'rgba(109, 40, 217, 0.12)',
            }),
      },
      components: {
        Layout: {
          headerBg: 'transparent',
          siderBg: isDark ? '#12101a' : '#ffffff',
          bodyBg: isDark ? '#07060c' : '#f4edff',
          footerBg: isDark ? '#0b0812' : '#21152f',
        },
        Menu: {
          itemBg: 'transparent',
          itemSelectedBg: isDark ? 'rgba(168, 85, 247, 0.18)' : 'rgba(109, 40, 217, 0.12)',
          itemHoverBg: isDark ? 'rgba(168, 85, 247, 0.12)' : 'rgba(109, 40, 217, 0.08)',
          itemSelectedColor: isDark ? '#f3e8ff' : '#5b21b6',
          horizontalItemSelectedColor: isDark ? '#f3e8ff' : '#5b21b6',
        },
        Drawer: {
          colorBgElevated: isDark ? '#12101a' : '#ffffff',
          colorBgMask: 'rgba(14, 6, 24, 0.72)',
        },
        Button: {
          borderRadius: 8,
          primaryShadow: isDark
            ? '0 14px 30px rgba(168, 85, 247, 0.28)'
            : '0 12px 28px rgba(109, 40, 217, 0.24)',
        },
        Card: {
          borderRadiusLG: 8,
          colorBgContainer: isDark ? '#12101a' : '#ffffff',
          boxShadowTertiary: isDark
            ? '0 18px 42px rgba(0, 0, 0, 0.35)'
            : '0 18px 42px rgba(59, 13, 110, 0.12)',
        },
        Select: {
          borderRadius: 8,
        },
        Input: {
          borderRadius: 8,
        },
      }
    }
  }, [isDark])

  return (
    <ConfigProvider theme={antdTheme}>
      <div
        className="cinema-app"
        data-theme={isDark ? 'dark' : 'light'}
      >
        <AppRouter setIsDark={setIsDark} isDark={isDark}/>
      </div>
    </ConfigProvider>
  )
}

export default App
