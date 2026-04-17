"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { questionSet } from "@/data/catalog";
import { computeRecommendations } from "@/lib/recommendations";
import { PosterCollage } from "@/components/poster-collage";

const initialAnswers = {
  energy: "comfort",
  format: "Movie",
  language: "Any",
  lastLiked: "",
  friendFactor: 6,
  ratingTolerance: 7.5
};

function deriveAnswerValue(question, answers) {
  return answers[question.id];
}

export function QuizClient() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultSource, setResultSource] = useState("fallback");
  const [liveRecommendations, setLiveRecommendations] = useState([]);

  const recommendations = useMemo(() => computeRecommendations(answers, 7), [answers]);
  const displayRecommendations = submitted && liveRecommendations.length ? liveRecommendations : recommendations;
  const question = questionSet[step];

  function updateAnswer(value) {
    setAnswers((current) => ({ ...current, [question.id]: value }));
  }

  async function nextStep() {
    if (step === questionSet.length - 1) {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(answers)
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Could not load live recommendations.");
        }

        setLiveRecommendations(payload.items || []);
        setResultSource(payload.source || "fallback");
        setSubmitted(true);
      } catch (requestError) {
        setError(requestError.message || "The live recommender glitched, so the fallback board is showing.");
        setLiveRecommendations(recommendations);
        setResultSource("fallback");
        setSubmitted(true);
      } finally {
        setLoading(false);
      }
      return;
    }

    setStep((current) => current + 1);
  }

  function resetQuiz() {
    setStep(0);
    setAnswers(initialAnswers);
    setSubmitted(false);
    setLoading(false);
    setError("");
    setResultSource("fallback");
    setLiveRecommendations([]);
  }

  return (
    <div className="content-grid">
      <section className="glass page-panel pixel-frame">
        <div className="mini-row" style={{ justifyContent: "space-between", marginBottom: "18px" }}>
          <div>
            <div className="label pixel">Predictor engine</div>
            <h1 className="section-title display" style={{ fontSize: "clamp(2.4rem, 7vw, 4.8rem)" }}>
              six sensible questions,
              <br />
              <span style={{ color: "var(--lime)" }}>seven locked picks</span>
            </h1>
          </div>
          <div className="score pixel">
            {submitted ? "results live" : `q ${step + 1} / ${questionSet.length}`}
          </div>
        </div>

        {!submitted ? (
          <div className="quiz-grid">
            <div className="glass card">
              <div className="label pixel">{question.label}</div>
              <h2 style={{ fontSize: "2rem", margin: "10px 0 8px" }}>{question.title}</h2>
              <p className="hint" style={{ marginBottom: "18px" }}>
                {question.subtitle}
              </p>

              {question.type === "single" ? (
                <div className="question-options">
                  {question.options.map((option) => (
                    <button
                      key={option.label}
                      className={`option-button ${deriveAnswerValue(question, answers) === option.value ? "selected" : ""}`}
                      onClick={() => updateAnswer(option.value)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}

              {question.type === "text" ? (
                <textarea
                  className="textarea"
                  rows={4}
                  value={answers[question.id]}
                  placeholder={question.placeholder}
                  onChange={(event) => updateAnswer(event.target.value)}
                />
              ) : null}

              {question.type === "range" ? (
                <div className="range-wrap">
                  <input
                    type="range"
                    min={question.min}
                    max={question.max}
                    step={question.step}
                    value={answers[question.id]}
                    onChange={(event) => updateAnswer(Number(event.target.value))}
                  />
                  <div className="mini-row" style={{ justifyContent: "space-between" }}>
                    <span className="muted">{question.labels[0]}</span>
                    <strong>{answers[question.id]} / 10</strong>
                    <span className="muted">{question.labels[1]}</span>
                  </div>
                </div>
              ) : null}

              <div className="cta-row" style={{ marginTop: "22px" }}>
                <button className="button" type="button" onClick={nextStep}>
                  {loading ? "Scanning live catalog..." : step === questionSet.length - 1 ? "Drop my top 7" : "Next question"}
                </button>
                {step > 0 ? (
                  <button className="ghost-button" type="button" onClick={() => setStep((current) => current - 1)}>
                    Back
                  </button>
                ) : null}
              </div>
            </div>

            <aside className="glass card">
              <div className="label pixel">Instant pulse</div>
              <p className="hint" style={{ marginTop: "10px" }}>
                Your answers already tilt the engine toward {answers.energy}, {String(answers.format).toLowerCase()}, and a {answers.language.toLowerCase?.() || answers.language} lane.
              </p>
              <div className="content-stack" style={{ marginTop: "16px" }}>
                {recommendations.slice(0, 3).map((item) => (
                  <div className="mini-row" key={item.id}>
                    <div className="score">#{recommendations.findIndex((entry) => entry.id === item.id) + 1}</div>
                    <div>
                      <strong>{item.title}</strong>
                      <p className="muted" style={{ margin: "4px 0 0" }}>
                        {item.type} • {item.platforms.join(", ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        ) : (
          <div className="result-grid">
            <div className="glass card">
              <div className="label pixel">Top 7 collage</div>
              <h2 style={{ margin: "10px 0 18px" }}>Your binge-d board for tonight</h2>
              <p className="hint" style={{ marginBottom: "16px" }}>
                {resultSource === "tmdb-live"
                  ? "Live TMDb data is powering this board, with India watch providers and cast details."
                  : "Fallback sample board is showing because live API keys are missing or a live request failed."}
              </p>
              {error ? <p className="hint" style={{ color: "var(--orange)", marginBottom: "16px" }}>{error}</p> : null}
              <PosterCollage items={displayRecommendations} />
            </div>

            {displayRecommendations.map((item, index) => (
              <article className="glass result-card card pixel-frame" key={item.id}>
                <div className="result-poster">
                  <Image src={item.poster} alt={item.title} width={220} height={330} />
                </div>
                <div>
                  <div className="mini-row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div className="label pixel">#{index + 1} recommendation</div>
                      <h3 style={{ fontSize: "1.8rem", margin: "8px 0" }}>{item.title}</h3>
                    </div>
                    <div className="score">★ {item.rating.toFixed(1)}</div>
                  </div>
                  <p className="hint">{item.blurb}</p>
                  <div className="inline-badges">
                    <span className="inline-badge">{item.type}</span>
                    <span className="inline-badge">{item.language}</span>
                    {item.year ? <span className="inline-badge">{item.year}</span> : null}
                    {item.platforms.map((platform) => (
                      <span className="inline-badge" key={platform}>
                        Watch on {platform}
                      </span>
                    ))}
                    {item.imdbId ? <span className="inline-badge">IMDb {item.imdbId}</span> : null}
                  </div>
                  <p className="hint" style={{ marginTop: "14px" }}>
                    <strong style={{ color: "var(--cyan)" }}>Why this hit your board:</strong> {item.why || "strong all-round score across mood, format, and social fit."}
                  </p>
                  <p className="hint" style={{ marginTop: "10px" }}>
                    <strong>Cast:</strong> {(item.cast || []).join(", ") || "Cast details unavailable"}
                  </p>
                </div>
              </article>
            ))}

            <div className="cta-row">
              <button className="button" type="button" onClick={resetQuiz}>
                Run it again
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
