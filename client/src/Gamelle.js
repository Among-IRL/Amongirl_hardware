import React from 'react';
import {useFirestoreConnect} from "react-redux-firebase";
import {useSelector} from "react-redux";

const Gamelle = () => {
  useFirestoreConnect([{collection: "sensors"}])

  const sensors = useSelector((state) => state.firestore.sensors)

  return <>"dsdmlfksdf"</>
}
export default Gamelle
