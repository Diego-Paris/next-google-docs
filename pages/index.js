import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Header from "../components/Header";
import Icon from "@material-tailwind/react/Icon";
import Button from "@material-tailwind/react/Button";
import { getSession, getProviders } from "next-auth/client";
import Login from "../components/Login";
import Modal from "@material-tailwind/react/Modal";
import ModalBody from "@material-tailwind/react/ModalBody";
import ModalFooter from "@material-tailwind/react/ModalFooter";
import Input from "@material-tailwind/react/Input";
import ModalHeader from "@material-tailwind/react/ModalHeader";
import { db } from "../firebase";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { useCollectionOnce } from "react-firebase-hooks/firestore";
import DocumentRow from "../components/DocumentRow";
import { useRouter } from "next/router";

export default function Home({ session, providers }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [input, setInput] = useState("");
  const [snapshot] = useCollectionOnce(
    db
      .collection("userDocs")
      .doc(session?.user?.email)
      .collection("docs")
      .orderBy("timestamp", "desc")
  );

  if (!session) return <Login providers={providers} />;

  function createDocument() {
    // if not input then return
    if (!input) return;

    db.collection("userDocs")
      .doc(session.user.email)
      .collection("docs")
      .add({
        fileName: input,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then((docRef) => {
        router.push(`/doc/${docRef.id}`);
        setInput("");
        setShowModal(false);
      });
  }
  const modal = (
    <Modal size="sm" active={showModal} toggler={() => setShowModal(false)}>
      <ModalHeader className="" toggler={() => setShowModal(false)}>
        <p className="text-base">Create a document</p>
      </ModalHeader>
      <ModalBody>
        <Input
          type="text"
          color="lightBlue"
          size="md"
          placeholder="Document Name"
          outline={true}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createDocument()}
        />
      </ModalBody>

      <ModalFooter>
        <Button
          color="blue"
          buttonType="link"
          ripple="dark"
          rounded={true}
          onClick={(e) => setShowModal(false)}
        >
          Cancel
        </Button>

        <Button
          color="blue"
          // buttonType="link"
          ripple="light"
          rounded={true}
          onClick={createDocument}
        >
          Create
        </Button>
      </ModalFooter>
    </Modal>
  );

  return (
    <div className="w-screen">
      <Head>
        <title>Google Docs</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      {modal}

      <section className="bg-[#F1F3F4] pb-10 px-5  w-full">
        <div className="max-w-3xl md:mx-auto">
          <div className="flex items-center justify-between py-2">
            <h2 className="text-gray-700 text-lg">Start a new document</h2>

            <Button
              color="darkgray"
              buttonType="outline"
              rounded={true}
              iconOnly={true}
              ripple="dark"
              className="border-0"
            >
              <Icon name="more_vert" size="2xl" />
            </Button>
          </div>

          <div>
            <div
              onClick={() => setShowModal(true)}
              className="relative h-52 w-40 border-2 cursor-pointer hover:border-blue-400"
            >
              <Image src="https://rb.gy/wlvbum" layout="fill" alt="" />
            </div>
            <p className="mt-2 ml-2 text-gray-700 text-sm font-bold sm:font-semibold">
              Blank
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Container */}

      <table className="bg-white pt-8 px-10 md:px-0 w-[100%] lg:w-[55%] mx-auto select-none">
        <thead>
          <tr className="flex items-center p-2 text-gray-700">
            <th className="col-1 font-semibold text-sm sm:text-base">
              My Documents
            </th>
            <th className="col-2 font-semibold text-sm sm:text-base">
              Date Created
            </th>
            <th className="col-3">
              <Icon name="folder" size="2xl" color="gray" />
            </th>
          </tr>
        </thead>

        <tbody>
          {snapshot?.docs.map((doc) => {
            return (
              <DocumentRow
                key={doc.id}
                id={doc.id}
                fileName={doc.data().fileName}
                date={doc.data().timestamp}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export async function getServerSideProps(context) {
  // Get the user session and the providers
  const session = await getSession(context);
  const providers = await getProviders();

  return {
    props: {
      session,
      providers,
    },
  };
}
