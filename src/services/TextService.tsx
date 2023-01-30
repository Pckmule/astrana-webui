const formatHtml = (text: string) => 
{
    let formattedText = "<p>" + text + "</p>";
    
    var regex = new RegExp(/(\r\n?|\n|\t)/g);

    formattedText = formattedText.replace(regex, '</p><p>');

    return formattedText;
}

const TextService = {
  formatHtml
};

export default TextService;