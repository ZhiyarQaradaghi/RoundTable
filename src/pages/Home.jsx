import { useState } from "react";
import Navigation from "../components/Navigation/Navigation";
import Filters from "../components/Filters/Filters";
import DiscussionList from "../components/DiscussionList/DiscussionList";
import styles from "./Home.module.css";

const TAGS = [
  "All",
  "Politics",
  "Gaming",
  "Economy",
  "Technology",
  "Science",
  "Sports",
];

const DISCUSSION_TYPES = ["Free Talk", "Queue Based", "Moderated"];

const CHANNELS = [
  {
    id: 1,
    title: "Global Economic Trends",
    tags: ["Economy", "Politics"],
    type: "Moderated",
    description:
      "Discussion about current global economic trends, market analysis, and financial policies. Moderated discussions ensure focused and productive conversations.",
    participants: 234,
    creator: "Sarah Chen",
  },
  {
    id: 2,
    title: "Gaming Development",
    tags: ["Gaming", "Technology"],
    type: "Free Talk",
    description:
      "Share and discuss game development techniques, industry news, and upcoming releases. Open discussion format welcomes all perspectives.",
    participants: 567,
    creator: "Alex Martinez",
  },
  {
    id: 3,
    title: "Tech Innovation",
    tags: ["Technology", "Science"],
    type: "Queue Based",
    description:
      "Explore the latest technological innovations, AI developments, and future tech trends. Queue-based discussions for organized participation.",
    participants: 789,
    creator: "David Kim",
  },
  {
    id: 4,
    title: "Political Discourse",
    tags: ["Politics"],
    type: "Moderated",
    description:
      "Open discussions about current political events, policies, and global affairs. Moderated for civil and constructive dialogue.",
    participants: 432,
    creator: "Emma Wilson",
  },
  {
    id: 5,
    title: "Casual Gaming Lounge",
    tags: ["Gaming"],
    type: "Free Talk",
    description:
      "A relaxed space to discuss your favorite games, share gaming moments, and connect with fellow gamers.",
    participants: 321,
    creator: "Marcus Johnson",
  },
];

function Home() {
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [expandedChannel, setExpandedChannel] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const userName = "John Doe";

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleCreateDiscussion = () => {
    // Implement create discussion logic
    console.log("Create discussion clicked");
  };

  const filteredChannels = CHANNELS.filter((channel) => {
    const matchesTag =
      selectedTag === "All" || channel.tags.includes(selectedTag);
    const matchesType = selectedType === "All" || channel.type === selectedType;
    const matchesSearch =
      channel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesType && matchesSearch;
  });

  return (
    <div className={styles.container}>
      <Navigation userName={userName} onSearch={handleSearch} />
      <main className={styles.main}>
        <Filters
          tags={TAGS}
          discussionTypes={DISCUSSION_TYPES}
          selectedTag={selectedTag}
          selectedType={selectedType}
          onTagSelect={setSelectedTag}
          onTypeSelect={setSelectedType}
          onCreateDiscussion={handleCreateDiscussion}
        />
        <DiscussionList
          channels={filteredChannels}
          expandedChannel={expandedChannel}
          onToggleChannel={(id) =>
            setExpandedChannel(expandedChannel === id ? null : id)
          }
        />
      </main>
    </div>
  );
}

export default Home;
