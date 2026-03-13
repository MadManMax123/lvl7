document.addEventListener("DOMContentLoaded", async () => {
  const loreBlock = document.getElementById("lore-block");
  const integralBlock = document.getElementById("integral-block");
  const answerInput = document.getElementById("answer-input");
  const answerSubmit = document.getElementById("answer-submit");
  const feedback = document.getElementById("integral-feedback");
  const audioBlock = document.getElementById("audio-block");
  const staticAudio = document.getElementById("static-audio");

  let loreSentences = [];
  let expectedAnswer = "";

  try {
    const res = await fetch("/data.json");
    if (!res.ok) throw new Error("Failed to load data.json");

    const data = await res.json();

    loreSentences = Array.isArray(data.loreSentences) ? data.loreSentences : [];
    expectedAnswer = String(data.expectedAnswer ?? "").trim();

    if (data.audioSrc && staticAudio) {
      const source = staticAudio.querySelector("source");
      if (source) {
        source.src = data.audioSrc;
        source.type = data.audioType || "audio/wav";
        staticAudio.load();
      }
    }

    if (data.downloadLink) {
      const downloadLink = document.getElementById("download-link");
      if (downloadLink) {
        downloadLink.href = data.downloadLink;
        downloadLink.textContent = data.downloadText || data.downloadLink;
      }
    }

    if (data.flagText) {
      const flagInline = document.querySelector(".flag-inline");
      if (flagInline) {
        flagInline.textContent = data.flagText;
      }
    }
  } catch (err) {
    console.error(err);
    if (feedback) {
      feedback.textContent = "failed to load node data.";
      feedback.className = "integral-feedback error";
    }
    return;
  }

  let loreIndex = 0;
  let isTyping = false;

  function typeSentence(sentence, callback) {
    const line = document.createElement("div");
    line.className = "lore-line";
    loreBlock.appendChild(line);

    let i = 0;
    isTyping = true;

    const interval = setInterval(() => {
      line.textContent = sentence.slice(0, i + 1);
      i++;

      if (i >= sentence.length) {
        clearInterval(interval);
        isTyping = false;
        if (callback) setTimeout(callback, 380);
      }
    }, 28);
  }

  function showNextSentence() {
    if (loreIndex >= loreSentences.length) {
      integralBlock.classList.remove("hidden");
      requestAnimationFrame(() => {
        integralBlock.classList.add("visible");
      });

      setTimeout(() => answerInput.focus(), 250);
      return;
    }

    typeSentence(loreSentences[loreIndex], () => {
      loreIndex++;
      setTimeout(showNextSentence, 260);
    });
  }

  function checkAnswer() {
    const value = (answerInput.value || "").trim();

    if (!value) {
      feedback.textContent = "input cannot be empty.";
      feedback.className = "integral-feedback error";
      return;
    }

    if (!/^[0-9]{4}$/.test(value)) {
      feedback.textContent = "enter exactly four digits.";
      feedback.className = "integral-feedback error";
      return;
    }

    answerInput.disabled = true;
    answerSubmit.disabled = true;

    feedback.textContent = "validating relay stability...";
    feedback.className = "integral-feedback";

    setTimeout(() => {
      if (value === expectedAnswer) {
        feedback.textContent = "stability confirmed. trace unlocked.";
        feedback.className = "integral-feedback ok";

        audioBlock.classList.remove("hidden");
        requestAnimationFrame(() => {
          audioBlock.classList.add("visible");
        });

        setTimeout(() => {
          staticAudio.play().catch(() => {});
        }, 350);
      } else {
        feedback.textContent = "incorrect. this node rejects unstable values.";
        feedback.className = "integral-feedback error";

        answerInput.disabled = false;
        answerSubmit.disabled = false;
        answerInput.focus();
        answerInput.select();
      }
    }, 750);
  }

  showNextSentence();

  answerSubmit.addEventListener("click", checkAnswer);

  answerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !isTyping) {
      checkAnswer();
    }
  });

  answerInput.addEventListener("input", () => {
    answerInput.value = answerInput.value.replace(/\D/g, "").slice(0, 4);
  });
});
