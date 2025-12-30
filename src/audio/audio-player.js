class AudioPlayer {
  audio;

  constructor(audioSource) {
  }

  play(audioSource, volume = 1) {
    if (this.audio !== null && this.audio !== undefined) {
      this.stop();
    }

    this.audio = new Audio(audioSource);
    this.audio.volume = volume.toFixed(2);

    return new Promise(async (resolve) => {
      const callback = () => {
        this.audio.removeEventListener('ended', callback);
        this.audio.removeEventListener('pause', callback);
        resolve();
      };

      this.audio.addEventListener('ended', callback);
      this.audio.addEventListener('pause', callback);
      await this.audio.play();
    });
  }

  stop() {
    if (this.audio === null || this.audio === undefined) {
      return;
    }

    this.audio.pause();
    this.audio.currentTime = 0;
  }
}

export default AudioPlayer;
