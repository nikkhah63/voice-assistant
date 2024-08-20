const Toast = ({message,isError}) => {
    return (<div class={`toast ${isError?"bg-lightred text-red":"bg-lightblue text-blue"}`}>
        {message}
    </div>);
}

export default Toast;