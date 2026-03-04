import { useState } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  ToastAndroid,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text
} from 'react-native'
import ChatBubble from '../components/chatBubble'
import ChatInput from '../components/chatInput'
import ChatHeader from '../components/chatHeader'
import speak from '../utils/speak'
import createAxiosClient from '../api/axiosClient'

import { useSession } from '../auth/context'

type ChatResponse = {
  message: string
  context?: any
}

type Message = {
  id: string
  text: string
  sender: 'user' | 'ai'
}

export default function ChatPage () {
  const { userData } = useSession()
  const client = createAxiosClient(userData?.token || null)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 Hi! I can help you understand weather conditions and flood risks.',
      sender: 'ai'
    }
  ])

  // handle chat input submission
  const handleSend = (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user'
    }
    setLoading(true)
    setMessages(prev => [...prev, userMsg])

    client
      .post('chatbots/chat', { message: text })
      .then((res: { data: ChatResponse }) => {
        const aiMsg: Message = {
          id: Math.random().toString(),
          text: res.data.message,
          sender: 'ai'
        }
        setMessages(prev => [...prev, aiMsg])
        speak(res.data.message)
      })
      .catch((error: any) => {
        ToastAndroid.show(
          `Failed to send message: ${error.message}`,
          ToastAndroid.SHORT
        )
        console.log('Error sending message:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      style={styles.container}
    >
      <ChatHeader />
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ChatBubble message={item.text} isUser={item.sender === 'user'} />
        )}
        ListFooterComponent={
          loading
            ? () => (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size='small' />
                  <Text style={styles.loadingText}>AI is typing...</Text>
                </View>
              )
            : null
        }
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={styles.messagesContent}
        style={styles.messagesList}
      />

      <ChatInput onSend={handleSend} />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 10
  },
  messagesList: {
    flex: 1
  },
  messagesContent: {
    padding: 16
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start'
  },
  loadingText: {
    marginLeft: 8,
    color: '#666'
  }
})
