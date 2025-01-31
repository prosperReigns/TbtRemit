import React, { useState, useEffect } from 'react';

const Carousel = () => {
    // State to hold the index of the current video
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // Array of videos for the carousel
    const videos = [
        '/assets/gif.mp4',
        '/assets/gif2.mp4',
        '/assets/gif3.mp4',
        '/assets/gif4.mp4',
    ];

    const captions = [
        'First caption for gif.mp4',
        'Second caption for gif2.mp4',
        'Third caption for gif3.mp4',
        'Fourth caption for gif4.mp4',
];

    // Change the video every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % videos.length);
        }, 5000);

        // Clear the interval on component unmount
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={carouselContainerStyle}>
            <video 
                key={currentIndex} 
                autoPlay 
                loop 
                muted 
                style={carouselVideoStyle}
            >
                <source src={videos[currentIndex]} type="video/mp4" />
            </video>

            <div style={carouselCaption}>
                {captions[currentIndex]}
            </div>
        </div>
    );
};

// Inline CSS styles
const carouselContainerStyle = {
    width: '100%',
    height: '100vh',
    position: 'absolute',
    top: '0',
    left: '0',
    zIndex: '-1',
};

const carouselVideoStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
};

const carouselCaption = {
    position: 'absolute', 
    zIndex: 3,
    fontSize: '2rem',
    fontWeight: 800,
    top: '50%', 
    right: '50px',
    transform: 'translateY(-50%)',
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '10px',
    borderRadius: '5px',
};


export default Carousel;
