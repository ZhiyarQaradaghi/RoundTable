export const reportUserOrDiscussion = async ({
  reportedUser,
  discussion,
  category,
  description,
}) => {
  const body = {
    category,
    description,
  };
  if (reportedUser) body.reportedUser = reportedUser;
  if (discussion) body.discussion = discussion;
  const response = await fetch("/api/reports", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to submit report");
  }
  return response.json();
};
