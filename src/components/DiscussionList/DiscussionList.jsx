import styles from "./DiscussionList.module.css";
import PropTypes from "prop-types";

function DiscussionList({ channels, expandedChannel, onToggleChannel }) {
  const getTypeClassName = (type) => {
    const baseClass = styles.typeTag;
    const typeClass = type.toLowerCase().replace(/\s+/g, "");
    return `${baseClass} ${styles[typeClass]}`;
  };

  return (
    <div className={styles.channelList}>
      {channels.map((channel) => (
        <div key={channel.id} className={styles.channelCard}>
          <div
            className={styles.channelHeader}
            onClick={() => onToggleChannel(channel.id)}
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
                <span className={styles.createdBy}>
                  Created by{" "}
                  <span className={styles.creatorName}>{channel.creator}</span>
                </span>
              </div>
            </div>
          </div>

          <div
            className={`${styles.channelContent} ${
              expandedChannel === channel.id ? styles.expanded : ""
            }`}
          >
            <p className={styles.channelDescription}>{channel.description}</p>
            <button className={styles.joinButton}>
              Join Discussion ({channel.participants})
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

DiscussionList.propTypes = {
  channels: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      tags: PropTypes.arrayOf(PropTypes.string).isRequired,
      type: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      participants: PropTypes.number.isRequired,
    })
  ).isRequired,
  expandedChannel: PropTypes.number,
  onToggleChannel: PropTypes.func.isRequired,
};

export default DiscussionList;
