import Link from 'next/link';
import { fetchPrivacyPolicy } from '../services/privacy-policy.service';

export default async function PrivacyPolicy() {
  const data = await fetchPrivacyPolicy();

  return (
    <div className='px-6 md:px-14 py-12'>
      <Link
        href='/'
        className='text-gray-600 hover:text-gray-800 mb-8 inline-block text-sm'
      >
        ← Back to home
      </Link>

      <div className='max-w-3xl mx-auto'>
        <h1 className='text-2xl font-bold mb-2'>Privacy Policy</h1>
        <p className='text-sm text-gray-600 mb-6'>
          Last updated: {data.lastUpdated}
        </p>

        <section className='space-y-8'>
          {data.sections.map((section, index) => (
            <div key={index} className='space-y-4'>
              <h2 className='text-lg font-bold'>{section.title}</h2>
              
              {section.content.map((paragraph, pIndex) => (
                <p key={pIndex} className='text-[15px] leading-relaxed'>
                  {paragraph}
                </p>
              ))}

              {section.listItems && (
                <ul className='list-disc ml-5 space-y-2'>
                  {section.listItems.map((item, itemIndex) => (
                    <li key={itemIndex} className='text-[15px] leading-relaxed'>
                      {item.includes(':') ? (
                        <>
                          <span className='font-bold'>{item.split(':')[0]}:</span>
                          {item.split(':')[1]}
                        </>
                      ) : item}
                    </li>
                  ))}
                </ul>
              )}

              {section.subsections && (
                <div className='space-y-4'>
                  {section.subsections.map((subsection, subIndex) => (
                    <div key={subIndex} className='space-y-2'>
                      {subsection.content.map((paragraph, pIndex) => (
                        <p key={pIndex} className='text-[15px] leading-relaxed'>
                          {pIndex === 0 && <span className='font-bold'>{subsection.title}</span>} {paragraph}
                        </p>
                      ))}
                      {subsection.listItems && (
                        <ul className='list-disc ml-5 space-y-2'>
                          {subsection.listItems.map((item, itemIndex) => (
                            <li key={itemIndex} className='text-[15px] leading-relaxed'>
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className='space-y-2'>
            <h2 className='text-lg font-bold'>9. Contact Us</h2>
            <p className='text-[15px] leading-relaxed'>
              If you have questions or concerns about this Privacy Policy, please contact us at:
            </p>
            <div className='space-y-2'>
              <p className='text-[15px]'>
                Email:{' '}
                <a
                  href={`mailto:${data.contactInfo.email}`}
                  className='text-blue-600 hover:text-blue-800'
                >
                  {data.contactInfo.email}
                </a>
              </p>
              <p className='text-[15px]'>
                Address: {data.contactInfo.address}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
