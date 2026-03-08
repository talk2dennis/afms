import React from 'react'
import { useState } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Link } from 'expo-router'
import colors from '../assets/colors'
import { useSession } from './auth/context'

const WelcomePage = () => {
  const [page, setPage] = useState(0)
  const [showLogoutAction, setShowLogoutAction] = useState(false)
  const { signOut } = useSession()

  const pages = [
    {
      title: 'AI Powered Flood Management',
      subtitle: 'AFMS',
      description:
        'AFMS stands for AI powered Flood Management System. It helps users stay informed, prepared, and safer during flood events. Can also report flood incidents and chat with the AFMS AI assistant for personalized advice. Reports are verified by admins to ensure reliability and accuracy of information.'
    },
    {
      title: 'Location-Based Flood Alerts',
      subtitle: 'Real-Time Awareness',
      description:
        'Users receive flood related alerts based on their location so they can make faster decisions and reduce risk to life and property. You can choose your notification preferences and stay informed without feeling overwhelmed (email, sms, and push notifications).'
    },
    {
      title: 'Reports And AI Assistant',
      subtitle: 'Community + Intelligence',
      description:
        'Users can submit reports that are verified by admins, and chat with the AFMS AI assistant for flood advice tailored to their context.'
    }
  ]

  const isLastPage = page === pages.length - 1

  const handleNext = () => {
    if (isLastPage) {
      return
    }
    setPage(prev => prev + 1)
  }

  const handleBack = () => {
    if (page === 0) {
      return
    }
    setPage(prev => prev - 1)
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/afms_logo.png')}
        style={styles.logo}
        resizeMode='contain'
      />

      <Text style={styles.title}>{pages[page].subtitle}</Text>
      <Text style={styles.subtitle}>{pages[page].title}</Text>

      <Text style={styles.description}>{pages[page].description}</Text>

      <View style={styles.indicatorRow}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[styles.indicator, index === page && styles.activeIndicator]}
          />
        ))}
      </View>

      {!isLastPage && (
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.smallButton, page === 0 && styles.hiddenButton]}
            onPress={handleBack}
            disabled={page === 0}
          >
            <Text style={styles.smallButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLastPage && (
        <>
          <Link href='/signin' asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Proceed To Login</Text>
            </TouchableOpacity>
          </Link>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>New here?</Text>
            <Link href='/register' asChild>
              <TouchableOpacity>
                <Text style={styles.registerLink}>Create an account</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    justifyContent: 'center'
  },
  topControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 50,
    alignItems: 'flex-end'
  },
  toggleBtn: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  toggleBtnText: {
    color: colors.black,
    fontSize: 12,
    fontWeight: '700'
  },
  logoutBtn: {
    marginTop: 8,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  logoutBtnText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '700'
  },
  logo: {
    width: 110,
    height: 110,
    alignSelf: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: colors.black,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 14
  },
  description: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 22,
    gap: 8
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d5d5d5'
  },
  activeIndicator: {
    width: 20,
    backgroundColor: colors.primary
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
    marginBottom: 10
  },
  smallButton: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 18,
    minWidth: 90,
    alignItems: 'center'
  },
  hiddenButton: {
    opacity: 0
  },
  smallButtonText: {
    color: colors.black,
    fontWeight: '700',
    fontSize: 16
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%'
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '800'
  },
  registerRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  registerText: {
    color: colors.black
  },
  registerLink: {
    color: colors.secondary,
    marginLeft: 6,
    fontWeight: '700'
  }
})

export default WelcomePage
