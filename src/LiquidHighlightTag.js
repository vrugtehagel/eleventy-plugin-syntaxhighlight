const HighlightPairedShortcode = require("./HighlightPairedShortcode");

class LiquidHighlightTag {
  constructor(liquidEngine) {
    this.liquidEngine = liquidEngine;
  }

  getObject() {
    let ret = function(highlighter) {
      return {
        parse: function(tagToken, remainTokens) {
          let split = tagToken.args.split(" ");

          this.language = split.shift();
          this.highlightLines = split.join(" ");

          this.tokens = [];

          var stream = highlighter.liquidEngine.parser.parseStream(remainTokens);

          stream
            .on("token", token => {
              if (token.name === "endhighlight") {
                stream.stop();
              } else {
                this.tokens.push(token);
              }
            })
            .on("end", x => {
              throw new Error("tag highlight not closed");
            });

          stream.start();
        },
        render: function(scope, hash) {
          let tokens = this.tokens.map(token => token.raw);
          let tokenStr = tokens.join("").trim();

          return Promise.resolve(HighlightPairedShortcode(tokenStr, this.language, this.highlightLines));
        }
      };
    };

    return ret(this);
  }
}

module.exports = LiquidHighlightTag;
