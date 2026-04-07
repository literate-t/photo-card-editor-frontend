import "./App.css";
import Card3DContainer from "./component/Card3DContainer";

function App() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      {/* <EditorCanvas /> */}

      {/* Card3DContainer test */}
      <Card3DContainer width={400} height={600}>
        <div className="w-full h-full bg-linear-to-br from-blue-500 to-purple-300 flex items-center justify-center text-white text-2xl font-bold">
          3D Tilt test
        </div>
      </Card3DContainer>
    </div>
  );
}

export default App;
