import Container from "@/components/universal/Container";
import ManageCategoriesClient from "./ManageCategoriesClient";
import getCategories from "@/actions/getCategories";
import { getCurrentUser } from "@/actions/getCurrentUser";
import NullData from "@/components/NullData";

const ManageCategories = async () => {
  const categories = await getCategories();
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return <NullData title="Access Denied" />;
  }
  return (
    <div className=" pt-8">
      <Container>
        <ManageCategoriesClient categories={categories} />
      </Container>
    </div>
  );
};

export default ManageCategories;
