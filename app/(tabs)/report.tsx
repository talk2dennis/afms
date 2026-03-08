import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  ToastAndroid,
  TextInput,
  Alert
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSession } from '../auth/context'
import { useEffect, useState } from 'react'
import Loading from '../components/loading'
import AddReportModal from '../components/addReportModal'
import FloodReport, {
  deleteReport,
  voteReport,
  type FloodReport as FloodReportType
} from '../data/report_data'
import createAxiosClient from '../api/axiosClient'

export default function ReportPage () {
  const { userData: user } = useSession()
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [reports, setReports] = useState<FloodReportType[]>([])
  const [updated, setUpdated] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [expandedReportIds, setExpandedReportIds] = useState<
    Record<string, boolean>
  >({})
  const [viewerVisible, setViewerVisible] = useState(false)
  const [viewerImages, setViewerImages] = useState<string[]>([])
  const [viewerIndex, setViewerIndex] = useState(0)
  const [stateFilter, setStateFilter] = useState('')
  const [lgaFilter, setLgaFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    FloodReportType['status'] | 'all'
  >('all')
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
        setReports(res.data)
      })
      .catch(error => {
        ToastAndroid.show(
          `Failed to fetch reports ${error.message}`,
          ToastAndroid.SHORT
        )
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
  const filteredReports = reports.filter(report => {
    const matchesState =
      !stateFilter ||
      report.state?.toLowerCase().includes(stateFilter.trim().toLowerCase())

    const matchesLga =
      !lgaFilter ||
      report.lga?.toLowerCase().includes(lgaFilter.trim().toLowerCase())

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'VERIFIED'
        ? report.status === 'VERIFIED'
        : statusFilter === 'PENDING'
        ? report.status === 'PENDING'
        : report.status === 'REJECTED'

    return matchesState && matchesLga && matchesStatus
  })

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE))

  const paginated = filteredReports.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  useEffect(() => {
    setPage(1)
  }, [stateFilter, lgaFilter, statusFilter])

  const hasActiveFilters =
    !!stateFilter.trim() || !!lgaFilter.trim() || statusFilter !== 'all'

  const clearFilters = () => {
    setStateFilter('')
    setLgaFilter('')
    setStatusFilter('all')
  }

  const toggleReportDetails = (reportId: string) => {
    setExpandedReportIds(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }))
  }

  const getReportImages = (report: FloodReportType) => {
    // get the first 3 url of the images for the report
    const imageList = report.images.slice(0, 3).map(img => img.url)
    return imageList
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
    // confirm before deleting
    Alert.alert(
      'Confirm delete',
      'Are you sure you want to delete this report?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setLoading(true)
            client
              .delete(`reports/${reportId}`)
              .then(res => {
                ToastAndroid.show('Report deleted', ToastAndroid.SHORT)
                setUpdated(!updated)
              })
              .catch(error => {
                ToastAndroid.show(
                  `Failed to delete report: ${error.message}`,
                  ToastAndroid.SHORT
                )
              })
              .finally(() => {
                setLoading(false)
              })
          }
        }
      ]
    )
  }

  if (loading) {
    return <Loading />
  }
  return (
    <View style={styles.container}>
      <FlatList
        data={paginated}
        keyExtractor={item => item._id}
        refreshing={refreshing}
        onRefresh={() => fetchReports(true)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          filteredReports.length === 0 && styles.emptyListContent
        ]}
        ListHeaderComponent={
          <View style={styles.filtersWrap}>
            <TextInput
              value={stateFilter}
              onChangeText={setStateFilter}
              placeholder='Filter by state (e.g. Lagos)'
              placeholderTextColor='#9ca3af'
              style={styles.filterInput}
            />
            <TextInput
              value={lgaFilter}
              onChangeText={setLgaFilter}
              placeholder='Filter by LGA (e.g. Ikeja)'
              placeholderTextColor='#9ca3af'
              style={styles.filterInput}
            />

            <View style={styles.statusRow}>
              <TouchableOpacity
                onPress={() => setStatusFilter('all')}
                style={[
                  styles.statusBtn,
                  statusFilter === 'all' && styles.statusBtnActive
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    statusFilter === 'all' && styles.statusTextActive
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setStatusFilter('VERIFIED')}
                style={[
                  styles.statusBtn,
                  statusFilter === 'VERIFIED' && styles.statusBtnActive
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    statusFilter === 'VERIFIED' && styles.statusTextActive
                  ]}
                >
                  Verified
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setStatusFilter('PENDING')}
                style={[
                  styles.statusBtn,
                  statusFilter === 'PENDING' && styles.statusBtnActive
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    statusFilter === 'PENDING' && styles.statusTextActive
                  ]}
                >
                  Pending
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setStatusFilter('REJECTED')}
                style={[
                  styles.statusBtn,
                  statusFilter === 'REJECTED' && styles.statusBtnActive
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    statusFilter === 'REJECTED' && styles.statusTextActive
                  ]}
                >
                  Rejected
                </Text>
              </TouchableOpacity>
            </View>

            {hasActiveFilters && (
              <TouchableOpacity onPress={clearFilters} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>Clear filters</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const userVote = user?.id ? item?.votes?.[user.id] : undefined
          const reportImages = getReportImages(item)
          const showFullDescription = !!expandedReportIds[item._id]

          return (
            <View style={styles.card}>
              {reportImages.length > 0 && (
                <View style={styles.imageRow}>
                  {reportImages.map((image: string, index: number) => (
                    <TouchableOpacity
                      key={`${item._id}-${image}-${index}`}
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

              <View
                style={[
                  styles.badge,
                  item.status === 'VERIFIED'
                    ? styles.badgeApproved
                    : styles.badgePending
                ]}
              >
                <Text style={styles.badgeText}>
                  {item.status === 'VERIFIED'
                    ? 'Verified'
                    : item.status === 'PENDING'
                    ? 'Pending'
                    : 'Rejected'}
                </Text>
              </View>

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
                      {item.user?.name || 'Anonymous'}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name='calendar-outline'
                      size={13}
                      color='#6b7280'
                    />
                    <Text style={styles.metaText}>
                      {formatCreatedAt(item.createdAt)}
                      {formatRelativeTime(item.createdAt)
                        ? ` (${formatRelativeTime(item.createdAt)})`
                        : ''}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => toggleReportDetails(item._id)}
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
                    onPress={() => handleVote(item._id, 'up')}
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
                    onPress={() => handleVote(item._id, 'down')}
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
                  {item.user._id === user!.id && (
                    <TouchableOpacity onPress={() => handleDelete(item._id)}>
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
          onPress={() => handleApprove(item._id)}
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
            <Text style={styles.emptyTitle}>
              {hasActiveFilters ? 'No matching reports' : 'No reports yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {hasActiveFilters
                ? 'Try adjusting your state, LGA, or status filters.'
                : 'Pull down to refresh or add your first report.'}
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
          filteredReports.length > PAGE_SIZE ? (
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

  filtersWrap: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12
  },

  filterInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
    marginBottom: 8
  },

  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4
  },

  statusBtn: {
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7
  },

  statusBtnActive: {
    backgroundColor: '#1e90ff',
    borderColor: '#1e90ff'
  },

  statusText: {
    color: '#1e90ff',
    fontWeight: '600',
    fontSize: 12
  },

  statusTextActive: {
    color: '#fff'
  },

  clearBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4
  },

  clearBtnText: {
    color: '#1e90ff',
    fontSize: 12,
    fontWeight: '600'
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
    height: 150
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
    top: 4,
    right: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopRightRadius: 10
  },

  badgePending: {
    backgroundColor: '#f39c12'
  },

  badgeApproved: {
    backgroundColor: '#2e7d32'
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
