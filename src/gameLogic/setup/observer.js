const observer = {
    subscriber: [],
    notifyEvent: (event, data)=>{
        observer.subscriber.forEach((sub)=>sub.execute(event, data));
    },
    addSubscriber: (sub)=>{
        observer.subscriber.push(sub);
    },
    unSubscriber: (sub)=>{
        observer.subscriber.pop(sub);
    }
}

export default observer;