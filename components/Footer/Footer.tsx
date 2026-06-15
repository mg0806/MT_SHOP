import getCategories from "@/actions/getCategories";
import FooterClient from "./FooterClient";

const Footer = async () => {
  const categories = await getCategories();
  const categoryNames = categories.map((category) => category.name);

  return <FooterClient categoryNames={categoryNames} />;
};

export default Footer;
