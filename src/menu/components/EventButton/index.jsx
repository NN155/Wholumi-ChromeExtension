import { Button, Event } from ".."

const EventButton = ({ eventKey, event, children, ...rest }) => {
    const handleClick = async () => {
        await Event.sendEvent({
            key: eventKey,
            event: event,
        });
    };

    return (
        <Button onClick={handleClick} {...rest}>
            {children}
        </Button>
    );
}

export default EventButton;