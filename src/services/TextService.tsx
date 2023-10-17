export default function TextService() 
{
    const formatHtml = (text: string) => 
    {
        let formattedText = "<p>" + text + "</p>";
        
        var regex = new RegExp(/(\r\n?|\n|\t)/g);

        formattedText = formattedText.replace(regex, '</p><p>');

        return formattedText;
    }

    const getTextDirection = (direction: string) => 
    {
        switch(direction.toLowerCase())
        {
            case 'ltr':
              return 'ltr';

            case 'rtl':
              return 'rtl';

            default:
              return 'auto';
        }
    }

    return {
      formatHtml,
      getTextDirection
    };
}