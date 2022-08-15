import { gql, useQuery } from "@apollo/client";
import { addApolloState, initializeApollo } from "../apolloClient/Client";

const todoQuery = gql`
  {
    todos {
      data {
        id
        title
        completed
      }
    }
  }
`;

export default function Home({ todo }) {
  const { loading, data } = useQuery(todoQuery);

  console.log("loading:", loading);

  console.log(todo ? { dataType: "server" } : "server is null");
  console.log(data ? { dataType: "client" } : "client is null");

  return <div></div>;
}

export const getServerSideProps = async ({ req }) => {
  const apolloClient = initializeApollo({ ctx: { req } });

  const { data } = await apolloClient.query({ query: todoQuery });

  return addApolloState(apolloClient, {
    props: {
      todo: { ...data.todos, type: "server" },
    },
  });
};
