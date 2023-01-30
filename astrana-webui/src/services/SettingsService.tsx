const getSettings = () => 
{
    var settings = {
      apiDomain: "https://localhost:7003/"
    };

    return settings;
}

const SettingsService = {
  getSettings
};

export default SettingsService;