export type FloodReport = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  state: string;
  lga: string;
  createdBy: string;
  approved: boolean;
  upvotes: number;
  downvotes: number;
  votes: Record<string, "up" | "down">;
};

const sampleReports: FloodReport[] = [];

// Function to add a new report
export const addReport = (report: FloodReport) => {
  sampleReports.push(report);
};

// Function to get all reports
export const getReports = (): FloodReport[] => {
  return sampleReports;
};

// Function to approve a report
export const approveReport = (reportId: string) => {
  const report = sampleReports.find((r) => r.id === reportId);
  if (report) {
    report.approved = true;
  }
};

// function to disapprove a report
export const disapproveReport = (reportId: string) => {
  const report = sampleReports.find((r) => r.id === reportId);
    if (report) {
    report.approved = false;
    }
};

// Function to upvote a report
export const voteReport = (reportId: string, userId: string, type: "up" | "down") => {
    const report = sampleReports.find((r) => r.id === reportId);
    // if user has already voted, remove previous vote
    if (report?.votes[userId]) {
        const previousVote = report.votes[userId];
        if (previousVote === "up") {
            if (report.upvotes > 0)
                report.upvotes--;
            
        } else {
            if (report.downvotes == 1)
                report.downvotes--;
        }
    }

    // add new vote
    if (report) {
        if (type === "up") {
            report.upvotes++;
        } else {
            report.downvotes++;
        }
        report.votes[userId] = type;
    }
};

// delete a report
export const deleteReport = (reportId: string) => {
    const index = sampleReports.findIndex((r) => r.id === reportId);
    if (index !== -1) {
        sampleReports.splice(index, 1);
    }
};

export default sampleReports;