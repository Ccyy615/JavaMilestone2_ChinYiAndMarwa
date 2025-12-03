export default function About() {
    return (
        <section style={{
            position: 'relative',
            height: '100vh',
            overflow: 'hidden'
        }}>
            {/* Parallax Background - Cabin Interior */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url('https://static01.nyt.com/images/2025/08/02/business/02DB-economy-class/02DB-economy-class-articleLarge.jpg?quality=75&auto=webp&disable=upscale')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                transform: 'translateZ(0)',
                willChange: 'transform'
            }} />
            
            {/* Dark Gradient Overlay */}
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
                    marginBottom: '1.5rem',
                    textShadow: '2px 2px 8px rgba(0,0,0,0.5)'
                }}>
                    About Our Service
                </h1>
                <p style={{ 
                    fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', 
                    marginBottom: '3rem',
                    maxWidth: '800px',
                    textShadow: '1px 1px 4px rgba(0,0,0,0.5)',
                    lineHeight: '1.6'
                }}>
                    We are here to help you to book your flight,<br />
                     managing the flight's details and managing the passengers
                </p>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '2rem',
                    maxWidth: '900px',
                    width: '100%',
                    marginBottom: '3rem'
                }}>
                    
                </div>
                
            </div>
        </section>
    );
}