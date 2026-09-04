import { useEffect, useState } from 'react'
import {
  generateId,
  loadActivities,
  loadResponses,
  removeMyResponse,
  saveActivities,
  saveResponses,
  saveMyResponse,
} from './lib/storage'
import { HomeScreen } from './components/HomeScreen'
import { CreateScreen } from './components/CreateScreen'
import { ParticipantScreen } from './components/ParticipantScreen'
import { ThankYouScreen } from './components/ThankYouScreen'
import { DashboardScreen } from './components/DashboardScreen'
import { EmptyState } from './components/shared'

function buildActivity(data) {
  return {
    name: data.name.trim(),
    managerName: data.managerName.trim(),
    start: data.start,
    end: data.end || '',
    notes: data.notes.trim(),
    responseDeadline: data.responseDeadline || '',
    altOptions: (data.altOptions || []).map((o) => ({
      id: o.id || generateId(),
      start: o.start,
      end: o.end || '',
    })),
  }
}

function App() {
  const [screen, setScreen] = useState('home')
  const [activities, setActivities] = useState(loadActivities)
  const [responses, setResponses] = useState(loadResponses)
  const [currentActivityId, setCurrentActivityId] = useState(null)
  const [editingActivityId, setEditingActivityId] = useState(null)

  useEffect(() => {
    saveActivities(activities)
  }, [activities])

  useEffect(() => {
    saveResponses(responses)
  }, [responses])

  function goHome() {
    setEditingActivityId(null)
    setScreen('home')
  }

  function handleCreateActivity(data) {
    const id = generateId()
    const activity = {
      id,
      ...buildActivity(data),
      status: 'open',
      confirmedOptionId: null,
      createdAt: Date.now(),
    }
    setActivities((prev) => ({ ...prev, [id]: activity }))
    setResponses((prev) => ({ ...prev, [id]: prev[id] || [] }))
    setCurrentActivityId(id)
    return id
  }

  function handleUpdateActivity(id, data) {
    setActivities((prev) => {
      const existing = prev[id]
      if (!existing) return prev
      return { ...prev, [id]: { ...existing, ...buildActivity(data) } }
    })
  }

  function handleCancelActivity(id) {
    setActivities((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], status: 'cancelled' } } : prev))
  }

  function handleConfirmFinal(id, optionId) {
    setActivities((prev) =>
      prev[id]
        ? { ...prev, [id]: { ...prev[id], status: 'confirmed', confirmedOptionId: optionId } }
        : prev
    )
  }

  function handleDeleteActivity(id) {
    setActivities((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setResponses((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    removeMyResponse(id)
    goHome()
  }

  function handleSubmitResponse(activityId, data) {
    const responseId = data.responseId || generateId()
    setResponses((prev) => {
      const list = prev[activityId] || []
      const exists = list.some((r) => r.id === responseId)
      const nextList = exists
        ? list.map((r) =>
            r.id === responseId
              ? {
                  ...r,
                  participantName: data.participantName,
                  choice: data.choice,
                  otherStart: data.otherStart,
                  otherNote: data.otherNote,
                  generalNote: data.generalNote,
                  updatedAt: Date.now(),
                }
              : r
          )
        : [
            ...list,
            {
              id: responseId,
              participantName: data.participantName,
              choice: data.choice,
              otherStart: data.otherStart,
              otherNote: data.otherNote,
              generalNote: data.generalNote,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ]
      return { ...prev, [activityId]: nextList }
    })
    saveMyResponse(activityId, {
      responseId,
      participantName: data.participantName,
      choice: data.choice,
      otherStart: data.otherStart,
      otherNote: data.otherNote,
      generalNote: data.generalNote,
    })
    setCurrentActivityId(activityId)
    setScreen('thankyou')
  }

  const currentActivity = currentActivityId ? activities[currentActivityId] : null
  const currentResponses = currentActivityId ? responses[currentActivityId] || [] : []

  return (
    <div dir="rtl" className="min-h-screen bg-paperAlt text-ink">
      {screen === 'home' && (
        <HomeScreen
          onCreate={() => {
            setEditingActivityId(null)
            setScreen('create')
          }}
          activities={activities}
          onOpenActivity={(id) => {
            setCurrentActivityId(id)
            setScreen('dashboard')
          }}
        />
      )}

      {screen === 'create' && (
        <CreateScreen
          mode={editingActivityId ? 'edit' : 'create'}
          activity={editingActivityId ? activities[editingActivityId] : null}
          onCreate={handleCreateActivity}
          onUpdate={handleUpdateActivity}
          onGoDashboard={(id) => {
            setCurrentActivityId(id)
            setEditingActivityId(null)
            setScreen('dashboard')
          }}
          onPreviewParticipant={(id) => {
            setCurrentActivityId(id)
            setScreen('participant')
          }}
          onBack={goHome}
        />
      )}

      {screen === 'participant' &&
        (currentActivity ? (
          <ParticipantScreen
            activity={currentActivity}
            onSubmit={(data) => handleSubmitResponse(currentActivity.id, data)}
            onBack={goHome}
          />
        ) : (
          <EmptyState onBack={goHome} />
        ))}

      {screen === 'thankyou' &&
        (currentActivity ? (
          <ThankYouScreen onViewResults={() => setScreen('dashboard')} />
        ) : (
          <EmptyState onBack={goHome} />
        ))}

      {screen === 'dashboard' &&
        (currentActivity ? (
          <DashboardScreen
            activity={currentActivity}
            responses={currentResponses}
            onBack={goHome}
            onPreviewParticipant={() => setScreen('participant')}
            onEdit={() => {
              setEditingActivityId(currentActivity.id)
              setScreen('create')
            }}
            onCancelActivity={() => handleCancelActivity(currentActivity.id)}
            onConfirmFinal={(optionId) => handleConfirmFinal(currentActivity.id, optionId)}
            onDeleteActivity={() => handleDeleteActivity(currentActivity.id)}
          />
        ) : (
          <EmptyState onBack={goHome} />
        ))}
    </div>
  )
}

export default App
