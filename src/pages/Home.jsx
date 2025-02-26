import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  },
  {
    id: 2,
    title: "Gaming Development",
    tags: ["Gaming", "Technology"],
    type: "Free Talk",
    description:
      "Share and discuss game development techniques, industry news, and upcoming releases. Open discussion format welcomes all perspectives.",
    participants: 567,
  },
  {
    id: 3,
    title: "Tech Innovation",
    tags: ["Technology", "Science"],
    type: "Queue Based",
    description:
      "Explore the latest technological innovations, AI developments, and future tech trends. Queue-based discussions for organized participation.",
    participants: 789,
  },
  {
    id: 4,
    title: "Political Discourse",
    tags: ["Politics"],
    type: "Moderated",
    description:
      "Open discussions about current political events, policies, and global affairs. Moderated for civil and constructive dialogue.",
    participants: 432,
  },
  {
    id: 5,
    title: "Casual Gaming Lounge",
    tags: ["Gaming"],
    type: "Free Talk",
    description:
      "A relaxed space to discuss your favorite games, share gaming moments, and connect with fellow gamers.",
    participants: 321,
  },
];

function Home() {
  const navigate = useNavigate();
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [expandedChannel, setExpandedChannel] = useState(null);
  const userName = "John Doe"; // This should come from your auth state

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  const filteredChannels = CHANNELS.filter((channel) => {
    const matchesTag =
      selectedTag === "All" || channel.tags.includes(selectedTag);
    const matchesType = selectedType === "All" || channel.type === selectedType;
    return matchesTag && matchesType;
  });

  const toggleChannel = (channelId) => {
    setExpandedChannel(expandedChannel === channelId ? null : channelId);
  };

  const getTypeClassName = (type) => {
    const baseClass = styles.typeTag;
    const typeClass = type.toLowerCase().replace(/\s+/g, "");
    return `${baseClass} ${styles[typeClass]}`;
  };

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <span className={styles.logo}>RoundTable</span>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Welcome, {userName}</span>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.filterSection}>
          <div className={styles.filterGroup}>
            <h2 className={styles.filterTitle}>Filter by topic</h2>
            <div className={styles.tagList}>
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  className={`${styles.tagButton} ${
                    selectedTag === tag ? styles.active : ""
                  }`}
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <h2 className={styles.filterTitle}>Discussion Type</h2>
            <div className={styles.tagList}>
              <button
                className={`${styles.tagButton} ${
                  selectedType === "All" ? styles.active : ""
                }`}
                onClick={() => setSelectedType("All")}
              >
                All Types
              </button>
              {DISCUSSION_TYPES.map((type) => (
                <button
                  key={type}
                  className={`${styles.tagButton} ${
                    selectedType === type ? styles.active : ""
                  }`}
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.channelList}>
          {filteredChannels.map((channel) => (
            <div key={channel.id} className={styles.channelCard}>
              <div
                className={styles.channelHeader}
                onClick={() => toggleChannel(channel.id)}
              >
                <div className={styles.channelInfo}>
                  <h3 className={styles.channelTitle}>{channel.title}</h3>
                  <div className={styles.channelMeta}>
                    <div className={styles.channelTags}>
                      {channel.tags.map((tag) => (
                        <span key={tag} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                      <span className={getTypeClassName(channel.type)}>
                        {channel.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {expandedChannel === channel.id && (
                <div className={styles.channelContent}>
                  <p className={styles.channelDescription}>
                    {channel.description}
                  </p>
                  <button className={styles.joinButton}>
                    Join Discussion ({channel.participants})
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Home;
