
export class BusterGuard {
  constructor() {
    this.kangaroo = "🦘";
    this.bulldog = "🐶";
  }

  scanMessage(message) {
    const dodgyLinkPattern = /(http|https):\/\/(.*?)(\.ru|\.cn|\.tk|\.xyz|\.top|\.zip)/gi;
    const spammyWords = ["free crypto", "click here", "airdrop now", "1000%"];

    if (dodgyLinkPattern.test(message)) {
      return {
        type: "link",
        message: `${this.kangaroo} Kangaroo says: That link looks dodgy! I'm hopping it out of here.`
      };
    }

    if (spammyWords.some(word => message.toLowerCase().includes(word))) {
      return {
        type: "spam",
        message: `${this.bulldog} Bulldog growls: Spam alert! I'm biting that nonsense out.`
      };
    }

    return null;
  }
}
