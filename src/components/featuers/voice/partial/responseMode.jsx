const ResponseMode = ({responseMode,handleChangeMode}) => {
    return (<div className="flex flex-row flex-end w-full mb-2 text-blue">
        <span className="text-gray"> Response Mode:</span>
        <input type="radio" value="voice" name="responseMode" onChange={handleChangeMode} checked={responseMode == "voice" ? true : false} /> Voice
        <input type="radio" value="text" name="responseMode" onChange={handleChangeMode} checked={responseMode == "text" ? true : false} /> Text
    </div>);
}

export default ResponseMode;