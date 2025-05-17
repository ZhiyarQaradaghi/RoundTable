import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaFire } from "react-icons/fa";
import { BsClock } from "react-icons/bs";
import styles from "./Landing.module.css";

const TRENDING_DISCUSSIONS = [
  {
    id: 1,
    title: "The Future of AI in Healthcare",
    participants: 234,
    type: "Queue Based",
    topic: "Technology & Health",
    description: "Discussing the impact of AI on modern medicine",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&h=400",
  },
  {
    id: 2,
    title: "Sustainable Cities",
    participants: 189,
    type: "Free Talk",
    topic: "Environment",
    description: "Planning the future of urban development",
    image:
      "https://images.unsplash.com/photo-1518281420975-50db6e5d0a97?auto=format&fit=crop&w=800&h=400",
  },
  {
    id: 3,
    title: "Space Exploration 2024",
    participants: 312,
    type: "Queue Based",
    topic: "Science",
    description: "Latest developments in space technology",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&h=400",
  },
];

const TRENDING_TOPICS = [
  {
    name: "Technology",
    discussions: 1234,
    growth: "+25%",
    color: "#3B82F6",
  },
  {
    name: "Science",
    discussions: 856,
    growth: "+18%",
    color: "#10B981",
  },
  {
    name: "Politics",
    discussions: 2341,
    growth: "+32%",
    color: "#F59E0B",
  },
  {
    name: "Gaming",
    discussions: 1567,
    growth: "+15%",
    color: "#8B5CF6",
  },
];

function Landing() {
  const [activeSlide, setActiveSlide] = useState(0);
  const trendingRef = useRef(null);
  const exploreButtonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (trendingRef.current) observer.observe(trendingRef.current);
    if (exploreButtonRef.current) observer.observe(exploreButtonRef.current);

    return () => observer.disconnect();
  }, []);

  const scrollToTrending = () => {
    trendingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % TRENDING_DISCUSSIONS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % TRENDING_DISCUSSIONS.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) =>
      prev === 0 ? TRENDING_DISCUSSIONS.length - 1 : prev - 1
    );
  };

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <h1>RoundTable</h1>
        <div>
          <button onClick={() => navigate("/login")}>Login</button>
          <button onClick={() => navigate("/signup")}>Sign Up</button>
        </div>
      </nav>

      <main>
        <section className={styles.hero}>
          <h1>Engage in Meaningful Discussions</h1>
          <p>Join a community of thinkers, innovators, and curious minds.</p>
          <button onClick={() => navigate("/signup")}>
            Join the Conversation
          </button>
          <div
            className={styles.scrollIndicator}
            onClick={scrollToTrending}
            aria-label="Scroll to trending discussions"
          />
        </section>

        <section className={styles.showcase}>
          <h2>How RoundTable Works</h2>
          <div className={styles.showcaseGrid}>
            <div className={styles.showcaseItem}>
              <div className={styles.showcaseContent}>
                <h3>Queue-Based Discussions</h3>
                <p>
                  Organized, structured conversations where every voice gets
                  heard in turn.
                </p>
                <ul>
                  <li>Fair speaking order</li>
                  <li>Timed responses</li>
                  <li>Moderated discussions</li>
                </ul>
              </div>
              <div className={styles.showcaseVisual}>
                <img
                  src="https://picsum.photos/seed/queue/600/400"
                  alt="Queue-based discussions"
                  className={styles.showcaseImage}
                />
              </div>
            </div>

            <div className={styles.showcaseItem}>
              <div className={styles.showcaseVisual}>
                <img
                  src="https://picsum.photos/seed/live/600/400"
                  alt="Live interactions"
                  className={styles.showcaseImage}
                />
              </div>
              <div className={styles.showcaseContent}>
                <h3>Live Interactions</h3>
                <p>
                  Real-time engagement with instant feedback and dynamic
                  discussions.
                </p>
                <ul>
                  <li>Live reactions</li>
                  <li>Instant messaging</li>
                  <li>Active participation</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section ref={trendingRef} className={styles.trending}>
          <h2>Trending Discussions</h2>
          <div className={styles.carousel}>
            {TRENDING_DISCUSSIONS.map((discussion, index) => (
              <div
                key={discussion.id}
                className={`${styles.slide} ${
                  index === activeSlide ? styles.active : ""
                }`}
              >
                <img src={discussion.image} alt={discussion.title} />
                <div className={styles.slideContent}>
                  <span className={styles.topic}>{discussion.topic}</span>
                  <h3>{discussion.title}</h3>
                  <p>{discussion.description}</p>
                  <div className={styles.meta}>
                    <span className={styles.participants}>
                      <FaUsers className={styles.icon} />
                      {discussion.participants} participants
                    </span>
                    <span className={styles.type}>
                      <BsClock className={styles.icon} />
                      {discussion.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div className={styles.sliderControls}>
              <button
                className={styles.sliderButton}
                onClick={prevSlide}
                aria-label="Previous slide"
              >
                ←
              </button>
              <button
                className={styles.sliderButton}
                onClick={nextSlide}
                aria-label="Next slide"
              >
                →
              </button>
            </div>
            <div className={styles.dots}>
              {TRENDING_DISCUSSIONS.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${
                    index === activeSlide ? styles.activeDot : ""
                  }`}
                  onClick={() => setActiveSlide(index)}
                />
              ))}
            </div>
          </div>
          <button
            ref={exploreButtonRef}
            className={styles.exploreButton}
            onClick={() => navigate("/")}
          >
            Explore All Discussions
          </button>
        </section>
      </main>

      <section className={styles.trendingTopics}>
        <h2>Trending Topics</h2>
        <div className={styles.topicsGrid}>
          {TRENDING_TOPICS.map((topic) => (
            <div
              key={topic.name}
              className={styles.topicCard}
              style={{ "--topic-color": topic.color }}
            >
              <div className={styles.topicHeader}>
                <FaFire className={styles.fireIcon} />
                <span className={styles.growth}>{topic.growth}</span>
              </div>
              <h3>{topic.name}</h3>
              <p>{topic.discussions.toLocaleString()} discussions</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.stats}>
        <div className={styles.statCard}>
          <h3>10k+</h3>
          <p>Active Users</p>
        </div>
        <div className={styles.statCard}>
          <h3>5k+</h3>
          <p>Daily Discussions</p>
        </div>
        <div className={styles.statCard}>
          <h3>50+</h3>
          <p>Topic Categories</p>
        </div>
      </section>

      <section className={styles.testimonials}>
        <h2>Community Voices</h2>
        <div className={styles.testimonialGrid}>
          {[
            {
              name: "Sarah Chen",
              role: "Tech Enthusiast",
              quote:
                "RoundTable revolutionized how I engage in tech discussions.",
              avatar: "https://i.pravatar.cc/150?img=1",
            },
            {
              name: "Marcus Johnson",
              role: "Community Leader",
              quote: "The structured format ensures everyone's voice is heard.",
              avatar: "https://i.pravatar.cc/150?img=2",
            },
            {
              name: "Elena Rodriguez",
              role: "Student",
              quote: "Perfect platform for academic discussions and debates.",
              avatar: "https://i.pravatar.cc/150?img=3",
            },
          ].map((testimonial) => (
            <div key={testimonial.name} className={styles.testimonialCard}>
              <img src={testimonial.avatar} alt={testimonial.name} />
              <blockquote>{testimonial.quote}</blockquote>
              <div className={styles.testimonialAuthor}>
                <h4>{testimonial.name}</h4>
                <span>{testimonial.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2>Ready to Join the Conversation?</h2>
          <p>Start engaging in meaningful discussions today.</p>
          <button onClick={() => navigate("/signup")}>Get Started</button>
        </div>
      </section>

      <footer className={styles.footer}>
        <div>
          <h3>RoundTable</h3>
          <p>Where conversations matter</p>
        </div>
        <div>
          <p>© 2024 RoundTable. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
