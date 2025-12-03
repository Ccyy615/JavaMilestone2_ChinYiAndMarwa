// Home.tsx with parallax
export default function Home() {
    return (
        <section style={{
            position: 'relative',
            height: '100vh',
            overflow: 'hidden'
        }}>
            {/* Parallax Background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url('https://www.travelite.com/media/c8/e2/c7/1692284003/fliegen.webp?ts=1754485101')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                transform: 'translateZ(0)',
                willChange: 'transform'
            }} />
            
            {/* Dark Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7))'
            }} />
            
            {/* Content */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '2rem',
                color: 'white'
            }}>
                <h1 style={{ 
                    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                    marginBottom: '1rem',
                    textShadow: '2px 2px 8px rgba(0,0,0,0.5)'
                }}>
                    Welcome to flight booking app
                </h1>
                <p style={{ 
                    fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', 
                    marginBottom: '2rem',
                    maxWidth: '800px',
                    textShadow: '1px 1px 4px rgba(0,0,0,0.5)'
                }}>
                    Book flights, manage passengers, and travel with confidence
                </p>
            </div>
        </section>
    );
}