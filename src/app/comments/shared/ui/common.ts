export function formatMessage(message: String): string {
    let customMessage = '';
      const wordArray = message.split(' ');
      wordArray.map((t: string) => {
        if (t[0] === '@') {
          customMessage = customMessage + ' ' + '<span class="c-lightblue">' + t + '</span>';
        } else {
          customMessage = customMessage + ' ' + t;
        }
      });
      return customMessage;
  }