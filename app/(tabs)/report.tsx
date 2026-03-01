import React from 'react'
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSession } from '../auth/context'
import { useEffect, useState } from 'react'
import Loading from '../components/loading'
import AddReportModal from '../components/addReportModal'
import sampleReports, {
  addReport,
  getReports,
  approveReport,
  disapproveReport,
  deleteReport,
  voteReport
} from '../data/report_data'
import createAxiosClient from '../api/axiosClient'

export default function ReportPage () {
  const { userData: user } = useSession()
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [reports, setReports] = useState<any[]>(sampleReports as any[])
  const [updated, setUpdated] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [expandedReportIds, setExpandedReportIds] = useState<
    Record<string, boolean>
  >({})
  const [viewerVisible, setViewerVisible] = useState(false)
  const [viewerImages, setViewerImages] = useState<string[]>([])
  const [viewerIndex, setViewerIndex] = useState(0)
  const screenWidth = Dimensions.get('window').width

  const { userData } = useSession()
  const client = createAxiosClient(userData?.token || null)

  const fetchReports = (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    client
      .get('reports')
      .then(res => {
        const payload = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : []

        const normalizedReports = payload.map((report: any, index: number) => {
          const createdAtRaw =
            report?.createdAt ||
            report?.created_at ||
            report?.dateCreated ||
            null

          return {
            ...report,
            id: String(report?.id ?? `report-${index}`),
            creatorId: String(report?.createdBy ?? report?.user?._id ?? ''),
            creatorName: report.user == user?.id ? user?.name : 'Anonymous',
            createdAtRaw,
            upvotes: Number(report?.upvotes ?? 0),
            downvotes: Number(report?.downvotes ?? 0),
            votes:
              report?.votes && typeof report.votes === 'object'
                ? report.votes
                : {}
          }
        })

        setReports(normalizedReports)
      })
      .catch(error => {
        console.log('Failed to fetch reports:', error)
      })
      .finally(() => {
        if (isRefreshing) {
          setRefreshing(false)
          return
        }
        setLoading(false)
      })
  }

  // get updated reports if report is added/deleted/approved/voted
  useEffect(() => {
    fetchReports()
  }, [updated])

  const PAGE_SIZE = 10
  const totalPages = Math.max(1, Math.ceil(reports.length / PAGE_SIZE))

  const paginated = reports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const toggleReportDetails = (reportId: string) => {
    setExpandedReportIds(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }))
  }

  const getReportImages = (report: any) => {
    const imageList = Array.isArray(report?.images)
      ? report.images
          .map((img: any) => {
            if (typeof img === 'string') {
              return img
            }
            return img?.url
          })
          .filter(Boolean)
      : []

    const fallback =
      typeof report?.imageUrl === 'string' && report.imageUrl.trim().length > 0
        ? [report.imageUrl]
        : []

    return [...new Set([...imageList, ...fallback])].slice(0, 3)
  }

  const openImageViewer = (images: string[], startIndex: number) => {
    setViewerImages(images)
    setViewerIndex(startIndex)
    setViewerVisible(true)
  }

  const formatCreatedAt = (value: any) => {
    if (!value) {
      return 'Date unavailable'
    }

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      return 'Date unavailable'
    }

    return parsed.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatRelativeTime = (value: any) => {
    if (!value) {
      return ''
    }

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      return ''
    }

    const diffMs = Date.now() - parsed.getTime()
    const future = diffMs < 0
    const absDiff = Math.abs(diffMs)

    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour
    const week = 7 * day
    const month = 30 * day
    const year = 365 * day

    let valueNum = 0
    let unit = 'minute'

    if (absDiff >= year) {
      valueNum = Math.floor(absDiff / year)
      unit = 'year'
    } else if (absDiff >= month) {
      valueNum = Math.floor(absDiff / month)
      unit = 'month'
    } else if (absDiff >= week) {
      valueNum = Math.floor(absDiff / week)
      unit = 'week'
    } else if (absDiff >= day) {
      valueNum = Math.floor(absDiff / day)
      unit = 'day'
    } else if (absDiff >= hour) {
      valueNum = Math.floor(absDiff / hour)
      unit = 'hour'
    } else {
      valueNum = Math.max(1, Math.floor(absDiff / minute))
      unit = 'minute'
    }

    const suffix = valueNum === 1 ? unit : `${unit}s`
    return future ? `in ${valueNum} ${suffix}` : `${valueNum} ${suffix} ago`
  }

  const handleVote = (reportId: string, voteType: 'up' | 'down') => {
    voteReport(reportId, user!.id, voteType)
    setUpdated(!updated)
  }

  const handleDelete = (reportId: string) => {
    deleteReport(reportId)
    setUpdated(!updated)
  }

  if (loading) {
    return <Loading />
  }
  return (
    <View style={styles.container}>
      <FlatList
        data={paginated}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={() => fetchReports(true)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          reports.length === 0 && styles.emptyListContent
        ]}
        renderItem={({ item }) => {
          const userVote = user?.id ? item?.votes?.[user.id] : undefined
          const reportImages = getReportImages(item)
          const showFullDescription = !!expandedReportIds[item.id]

          return (
            <View style={styles.card}>
              {reportImages.length > 0 && (
                <View style={styles.imageRow}>
                  {reportImages.map((image: string, index: number) => (
                    <TouchableOpacity
                      key={`${item.id}-${image}-${index}`}
                      style={[
                        styles.imageThumbBtn,
                        index < reportImages.length - 1 && styles.imageThumbGap
                      ]}
                      onPress={() => openImageViewer(reportImages, index)}
                      activeOpacity={0.9}
                    >
                      <Image
                        source={{ uri: image }}
                        style={styles.imageThumb}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {!item.approved && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Pending</Text>
                </View>
              )}

              <View style={styles.cardBody}>
                <Text style={styles.title}>{item.title}</Text>

                <Text style={styles.location}>
                  <Ionicons name='location-outline' size={14} />
                  {'  '}
                  {item.lga}, {item.state}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name='person-outline' size={13} color='#6b7280' />
                    <Text style={styles.metaText}>
                      {item.creatorName || 'Anonymous'}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name='calendar-outline'
                      size={13}
                      color='#6b7280'
                    />
                    <Text style={styles.metaText}>
                      {formatCreatedAt(item.createdAtRaw)}
                      {formatRelativeTime(item.createdAtRaw)
                        ? ` (${formatRelativeTime(item.createdAtRaw)})`
                        : ''}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => toggleReportDetails(item.id)}
                  style={styles.detailsBtn}
                >
                  <Text style={styles.detailsBtnText}>
                    {showFullDescription ? 'Hide details' : 'View details'}
                  </Text>
                  <Ionicons
                    name={showFullDescription ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color='#1e90ff'
                  />
                </TouchableOpacity>

                <Text
                  style={styles.description}
                  numberOfLines={showFullDescription ? undefined : 2}
                >
                  {item.description}
                </Text>

                <View style={styles.voteRow}>
                  <TouchableOpacity
                    style={styles.voteBtn}
                    onPress={() => handleVote(item.id, 'up')}
                  >
                    <Ionicons
                      name='thumbs-up'
                      size={16}
                      color={userVote === 'up' ? '#2ecc71' : '#777'}
                    />
                    <Text style={styles.voteText}>{item.upvotes}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.voteBtn}
                    onPress={() => handleVote(item.id, 'down')}
                  >
                    <Ionicons
                      name='thumbs-down'
                      size={16}
                      color={userVote === 'down' ? '#e74c3c' : '#777'}
                    />
                    <Text style={styles.voteText}>{item.downvotes}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.actions}>
                  {item.creatorId === user!.id && (
                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                      <Ionicons
                        name='trash-outline'
                        size={20}
                        color='#e74c3c'
                      />
                    </TouchableOpacity>
                  )}

                  {/* {user!.role === "admin" && !item.approved && (
        <TouchableOpacity
          style={styles.approveBtn}
          onPress={() => handleApprove(item.id)}
        > */}
                  {/* <Text style={styles.approveText}>Approve</Text>
        </TouchableOpacity>
      )} */}
                </View>
              </View>
            </View>
          )
        }}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Ionicons name='document-text-outline' size={44} color='#7b8794' />
            <Text style={styles.emptyTitle}>No reports yet</Text>
            <Text style={styles.emptySubtitle}>
              Pull down to refresh or add your first report.
            </Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => setShowModal(true)}
            >
              <Text style={styles.emptyAddText}>Add Report</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          reports.length > PAGE_SIZE ? (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                disabled={page === 1}
                onPress={() => setPage(p => p - 1)}
              >
                <Text style={styles.pageBtnText}>Prev</Text>
              </TouchableOpacity>
              <Text style={styles.pageText}>
                Page {page} of {totalPages}
              </Text>
              <TouchableOpacity
                style={[
                  styles.pageBtn,
                  page === totalPages && styles.pageBtnDisabled
                ]}
                disabled={page === totalPages}
                onPress={() => setPage(p => p + 1)}
              >
                <Text style={styles.pageBtnText}>Next</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
      <View style={styles.fab}>
        <TouchableOpacity
          style={styles.fabBtn}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name='add' size={24} color='#fff' />
        </TouchableOpacity>
      </View>
      <AddReportModal visible={showModal} onClose={() => setShowModal(false)} />

      <Modal
        visible={viewerVisible}
        transparent
        animationType='fade'
        onRequestClose={() => setViewerVisible(false)}
      >
        <View style={styles.viewerBackdrop}>
          <TouchableOpacity
            style={styles.viewerCloseBtn}
            onPress={() => setViewerVisible(false)}
          >
            <Ionicons name='close' size={26} color='#fff' />
          </TouchableOpacity>

          <FlatList
            data={viewerImages}
            horizontal
            pagingEnabled
            keyExtractor={(image, index) => `${image}-${index}`}
            initialScrollIndex={viewerIndex}
            getItemLayout={(_, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index
            })}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={event => {
              const nextIndex = Math.round(
                event.nativeEvent.contentOffset.x / screenWidth
              )
              setViewerIndex(nextIndex)
            }}
            renderItem={({ item: image }) => (
              <View style={[styles.viewerImageWrap, { width: screenWidth }]}>
                <Image source={{ uri: image }} style={styles.viewerImage} />
              </View>
            )}
          />

          <View style={styles.viewerCountPill}>
            <Text style={styles.viewerCountText}>
              {viewerImages.length > 0 ? viewerIndex + 1 : 0}/
              {viewerImages.length}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
    paddingHorizontal: 14,
    paddingTop: 12
  },

  listContent: {
    paddingBottom: 90
  },

  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center'
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 3
  },

  imageRow: {
    flexDirection: 'row',
    padding: 10,
    paddingBottom: 0
  },

  imageThumbBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden'
  },

  imageThumbGap: {
    marginRight: 6
  },

  imageThumb: {
    width: '100%',
    height: 84
  },

  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: 'center',
    elevation: 2
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937'
  },

  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#6b7280',
    textAlign: 'center'
  },

  emptyAddBtn: {
    marginTop: 16,
    backgroundColor: '#1e90ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10
  },

  emptyAddText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },

  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#f39c12',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20
  },

  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },

  cardBody: {
    padding: 12
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
    color: '#222'
  },

  location: {
    fontSize: 12,
    color: '#1e90ff',
    marginBottom: 6
  },

  description: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 8
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1
  },

  metaText: {
    marginLeft: 4,
    color: '#6b7280',
    fontSize: 11
  },

  detailsBtn: {
    marginTop: 6,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start'
  },

  detailsBtnText: {
    marginRight: 4,
    color: '#1e90ff',
    fontSize: 13,
    fontWeight: '600'
  },

  voteRow: {
    flexDirection: 'row',
    marginTop: 10
  },

  voteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    paddingVertical: 5,
    paddingHorizontal: 9,
    backgroundColor: '#f5f5f5',
    borderRadius: 20
  },

  voteText: {
    marginLeft: 6,
    fontSize: 13
  },

  actions: {
    borderTopColor: '#27ae60',
    paddingTop: 8,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },

  approveBtn: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20
  },

  approveText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600'
  },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4
  },

  pageBtn: {
    backgroundColor: '#e7f1ff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8
  },

  pageBtnDisabled: {
    opacity: 0.45
  },

  pageBtnText: {
    color: '#1e90ff',
    fontWeight: '600'
  },

  pageText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '500'
  },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24
  },

  fabBtn: {
    backgroundColor: '#1e90ff',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5
  },

  viewerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.94)',
    justifyContent: 'center'
  },

  viewerCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 18,
    zIndex: 5,
    padding: 8
  },

  viewerImageWrap: {
    justifyContent: 'center',
    alignItems: 'center'
  },

  viewerImage: {
    width: '92%',
    height: 400,
    borderRadius: 14,
    resizeMode: 'cover'
  },

  viewerCountPill: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999
  },

  viewerCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  }
})
