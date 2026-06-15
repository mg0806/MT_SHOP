import getStoreSettings from "@/actions/getStoreSettings";
import SettingsClient from "./SettingsClient";

const SettingsPage = async () => {
  const settings = await getStoreSettings();
  return <SettingsClient settings={settings} />;
};

export default SettingsPage;
