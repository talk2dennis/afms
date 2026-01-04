import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "../auth/context";
import { useEffect, useState } from "react";
import Loading from "../components/loading";
import sampleReports, { addReport, getReports, approveReport, disapproveReport, deleteReport, voteReport } from "../data/report_data";

export default function ReportPage() {
    const { userData: user } = useSession();
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState(sampleReports);
    const [updated, setUpdated] = useState(false);
    const [visibleReports, setVisibleReports] = useState(sampleReports);

    const {signOut} = useSession();

    // hadle adding a new report
    const handleAddReport = () => {
        setLoading(true);
        const newReport = {
        id: (Date.now()).toString(),
        title: "Flood in Ikeja",
        description: "Road submerged after heavy rain",
        imageUrl: "https://via.placeholder.com/400",
        state: "Lagos",
        lga: "Ikeja",
        createdBy: user!.id,
        approved: false,
        upvotes: 0,
        downvotes: 0,
        votes: {},
    };
    // set time out to simulate network request
    setTimeout(() => {
        addReport(newReport);
        setUpdated(!updated);
        setLoading(false);
    }, 2000);
    };

    // handle voting on a report
    const handleVote = (reportId: string, userId: string, voteType: "up" | "down") => {
        voteReport(reportId, userId, voteType);
        setUpdated(!updated);
    };

    // handle deleting a report
    const handleDelete = (reportId: string) => {
        setLoading(true);
        deleteReport(reportId);
        setUpdated(!updated);
        setLoading(false);
    }

    // handle approving a report
    const handleApprove = (reportId: string) => {
        setLoading(true);
        approveReport(reportId);
        setUpdated(!updated);
        // delay to simulate network request
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    };
    
    // get updated reports if report is added/deleted/approved/voted
    useEffect(() => {
        setReports(getReports());
        setLoading(false);
    }, [updated]);

    const PAGE_SIZE = 10;

    const paginated = reports.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

    if (reports.length === 0 && !loading) {
        return (
            <View style={styles.center}>
                <Ionicons name="information-circle-outline" size={40} color="#777" />
                <Text style={{ marginTop: 10, fontSize: 16, color: "#777" }}>No reports available.</Text>
                <TouchableOpacity style={{ marginTop: 20 }} onPress={handleAddReport}>
                    <Text style={{ color: "#1e90ff" }}>Add a Report</Text>
                </TouchableOpacity>
            </View>
        );
    }
    
    if (loading) {
        return <Loading />;
    }
    return (
    <View style={{ flex: 1, backgroundColor: "#f2f4f7", padding: 16 }}>
        <FlatList
      data={paginated}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const userVote = item.votes[user!.id];

        return (
          <View style={styles.card}>
  <Image source={require("../../assets/flood.jpg")} style={styles.image} />

  {/* Status badge */}
  {!item.approved && (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>Pending</Text>
    </View>
  )}

  <View style={styles.cardBody}>
    <Text style={styles.title}>{item.title}</Text>

    <Text style={styles.location}>
      <Ionicons name="location-outline" size={14} />
      {"  "}
      {item.lga}, {item.state}
    </Text>

    <Text style={styles.description} numberOfLines={3}>
      {item.description}
    </Text>

    {/* Votes */}
    <View style={styles.voteRow}>
      <TouchableOpacity
        style={styles.voteBtn}
        onPress={() => handleVote(item.id, user!.id, "up")}
      >
        <Ionicons
          name="thumbs-up"
          size={16}
          color={userVote === "up" ? "#2ecc71" : "#777"}
        />
        <Text style={styles.voteText}>{item.upvotes}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.voteBtn}
        onPress={() => handleVote(item.id, user!.id, "down")}
      >
        <Ionicons
          name="thumbs-down"
          size={16}
          color={userVote === "down" ? "#e74c3c" : "#777"}
        />
        <Text style={styles.voteText}>{item.downvotes}</Text>
      </TouchableOpacity>
    </View>

    {/* Actions */}
    <View style={styles.actions}>
      {item.createdBy === user!.id && (
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#e74c3c" />
        </TouchableOpacity>
      )}

      {user!.role === "admin" && !item.approved && (
        <TouchableOpacity
          style={styles.approveBtn}
          onPress={() => handleApprove(item.id)}
        >
          <Text style={styles.approveText}>Approve</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
</View>

        );
      }}

      ListFooterComponent={
        <View style={styles.pagination}>
          <TouchableOpacity disabled={page === 1} onPress={() => setPage(p => p - 1)}>
            <Text>Prev</Text>
          </TouchableOpacity>
          <Text>Page {page}</Text>
          <TouchableOpacity onPress={() => setPage(p => p + 1)}>
            <Text>Next</Text>
          </TouchableOpacity>
        </View>
      }
    />
    <View style={styles.fab}>
        <TouchableOpacity style={styles.fabBtn} onPress={handleAddReport}>
            <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
    </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: "100%",
    height: 180,
  },

  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#f39c12",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  cardBody: {
    padding: 14,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
    color: "#222",
  },

  location: {
    fontSize: 13,
    color: "#1e90ff",
    marginBottom: 8,
  },

  description: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },

  voteRow: {
    flexDirection: "row",
    marginTop: 12,
  },

  voteBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
  },

  voteText: {
    marginLeft: 6,
    fontSize: 13,
  },

  actions: {
    borderTopColor: "#27ae60",
    paddingTop: 10,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  approveBtn: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  approveText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
  },

  fabBtn: {
    backgroundColor: "#1e90ff",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});

