export default function ContainerList({ title, children }) {
    return (
        <section className="nes-container with-title">
            <h3 className="title">{title}</h3>
            <div className="lists">
                <ul className="nes-list is-disc">
                    {children}
                </ul>
            </div>
        </section>
    )
}